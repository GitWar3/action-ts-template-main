/* eslint-disable no-console */
import * as core from '@actions/core';
import axios from 'axios';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

const today = dayjs.tz(dayjs(), 'Asia/Shanghai').format('YYYY年MM月DD日');
const TranslateMap = {
  refactor: '修改',
  fix: '修复',
  feat: '新增',
  perf: '优化',
};

const getCommits = async (token: string) =>
  await axios({
    method: 'GET',
    url: 'https://gitee.com/api/v5/repos/jammon/vue-sxerp/commits',
    params: {
      access_token: token,
      since: new Date(new Date().setHours(0, 0, 0)).toISOString(),
      until: new Date(new Date().setHours(23, 59, 59)).toISOString(),
      per_page: 100,
    },
  });

const pushMessage = async (key: string, commits: string[]) =>
  await axios({
    url: `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${key}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    data: {
      msgtype: 'markdown',
      markdown: {
        content: `### ${today}更新总计<font color="red">${
          commits.length
        }条</font>\n\n${commits.join('')}`,
      },
    },
  });

const filterActions = (commit: string) => {
  let currentKey: string = '';
  const flag = Object.keys(TranslateMap).some((key: string) => {
    if (commit.startsWith(key)) {
      currentKey = key;
      return true;
    }
    return false;
  });
  return flag && currentKey;
};

const translateActions = (commit: string) => {
  const key = filterActions(commit) as string;
  return `- ${commit.replace(key, TranslateMap[key])}`;
};

async function run(): Promise<void> {
  try {
    const giteeToken = core.getInput('GITEE_TOKEN', { required: true });
    const WXTKey = core.getInput('WX_KEY', { required: true });

    const { data: commits, status: commitsStatus } = await getCommits(giteeToken).catch(
      err => err.response,
    );
    if (commitsStatus !== 200) {
      // console.log(`get commits fail: ${commits.message}`);
      core.setFailed(`get commits fail: ${commits.message}`);
      return;
    }
    const messageList = commits
      .map(({ commit }: { commit: { message: string } }) => commit.message)
      .filter(filterActions)
      .map(translateActions);
    if (messageList.length) {
      const { data: pushRes } = await pushMessage(WXTKey, messageList);

      if (pushRes.errcode !== 0) {
        // console.log(`push message fail: ${pushRes.errmsg}`);
        core.setFailed(`push message fail: ${pushRes.errmsg}`);
      }
    }
  } catch (error) {
    // console.log(error);
    core.setFailed(error.message);
  }
}

run();
