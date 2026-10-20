// test.js — proves the leaderboard works.
// Run with: npm run seed && npm test

import assert from "node:assert/strict";
import { upvote, getTop, redis } from "./leaderboard.js";

async function run() {
  const target = "post:50"; // any seeded post id

  try {
    const exists = await redis.zscore("trending:posts", target);
    assert.notEqual(exists, null, "Target post is missing; run npm run seed first");

    // Upvote the target 50 times.
    for (let i = 0; i < 50; i++) {
      await upvote(target);
    }

    const top = await getTop(10);
    console.log("Top 10:");
    top.forEach((p, i) => console.log(`  #${i + 1}  ${p.id}  score=${p.score}  ${p.title} (${p.author})`));

    const targetPost = top.find((p) => p.id === target);
    assert.ok(targetPost, `${target} should reach the top 10 after 50 upvotes`);
    assert.equal(typeof targetPost.score, "number");
    assert.equal(targetPost.title, "Post number 50");
    assert.equal(targetPost.author, "@user50");

    console.log(`\nPASS ✅  ${target} reached the top 10`);
  } finally {
    redis.disconnect();
  }
}

run().catch((error) => {
  console.error("\nFAIL ❌", error);
  process.exitCode = 1;
});
