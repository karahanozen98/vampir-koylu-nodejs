const express = require("express");
const AsyncRouter = require("../utils/asyncRouter");
const router = new AsyncRouter(express.Router());
const game = require("../Game");

router.get("/users", (_req, res) => {
  res.send(game.users);
});

router.get("/isGameRunning", (_req, res) => {
  res.send(game.isRunning);
});

module.exports = router;
