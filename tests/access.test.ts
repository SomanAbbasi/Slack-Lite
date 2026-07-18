import assert from "node:assert/strict";
import test from "node:test";
import {
  buildInviteLink,
  canDeleteChannel,
  isConversationParticipant,
  isSafeReturnTo,
  isValidConvexId,
  normalizeJoinCode,
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

test("isValidConvexId rejects polluted invite paste values", () => {
  assert.equal(isValidConvexId("k97cyxrsc4h80118agc215hek18788k8"), true);
  assert.equal(
    isValidConvexId("k97cyxrsc4h80118agc215hek18788k8%20Code%3A%20123456"),
    false,
  );
  assert.equal(
    isValidConvexId("k97cyxrsc4h80118agc215hek18788k8 Code: 123456"),
    false,
  );
});

test("buildInviteLink keeps code in query string only", () => {
  const link = buildInviteLink(
    "http://localhost:3000",
    "k97cyxrsc4h80118agc215hek18788k8",
    "AB12CD34",
  );
  assert.equal(
    link,
    "http://localhost:3000/join/k97cyxrsc4h80118agc215hek18788k8?code=AB12CD34",
  );
  assert.equal(normalizeJoinCode(" ab-12 cd "), "AB12CD");
});
