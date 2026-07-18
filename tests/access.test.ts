import assert from "node:assert/strict";
import test from "node:test";
import {
  canDeleteChannel,
  isConversationParticipant,
  isSafeReturnTo,
  shouldIncludeMessageInSearch,
} from "../src/lib/access.ts";

test("isSafeReturnTo accepts relative app paths", () => {
  assert.equal(isSafeReturnTo("/join/abc"), true);
  assert.equal(isSafeReturnTo("/workspace/1/channel/2"), true);
});

test("isSafeReturnTo rejects open redirects and auth loops", () => {
  assert.equal(isSafeReturnTo("//evil.com"), false);
  assert.equal(isSafeReturnTo("/auth"), false);
  assert.equal(isSafeReturnTo("/auth?x=1"), false);
  assert.equal(isSafeReturnTo(null), false);
});

test("canDeleteChannel protects general and last channel", () => {
  assert.equal(canDeleteChannel("general", 5), false);
  assert.equal(canDeleteChannel("random", 1), false);
  assert.equal(canDeleteChannel("random", 2), true);
});

test("DM participant checks keep search private", () => {
  const conversation = { memberOneId: "a", memberTwoId: "b" };
  assert.equal(isConversationParticipant(conversation, "a"), true);
  assert.equal(isConversationParticipant(conversation, "c"), false);
  assert.equal(
    shouldIncludeMessageInSearch({ conversation, memberId: "a" }),
    true,
  );
  assert.equal(
    shouldIncludeMessageInSearch({ conversation, memberId: "c" }),
    false,
  );
  assert.equal(
    shouldIncludeMessageInSearch({ conversation: null, memberId: "c" }),
    true,
  );
});
