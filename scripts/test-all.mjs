import { spawnSync } from 'node:child_process';
const tests = ['test-engine.cjs','test-chat.mjs','test-chat-ui.mjs','test-guide.mjs','test-ui.cjs','test-voice.mjs','test-production.mjs'];
for (const file of tests) {
 const result = spawnSync(process.execPath, [file], { stdio:'inherit' });
 if (result.status !== 0) process.exit(result.status || 1);
}
