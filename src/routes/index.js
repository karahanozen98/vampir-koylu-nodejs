const express = require("express");
const AsyncRouter = require("../utils/asyncRouter");
const router = new AsyncRouter(express.Router());
const game = require("../Game");

router.get("/", (_req, res) => {
  res.send("API is up and running");
});

router.get("/users", (_req, res) => {
    res.send(game.users);
});

router.get("/isGameRunning", (_req, res) => {
    res.send(game.isRunning);
});

router.get("/kill", (_req, res) => {
    game.users = [];
    game.connections = [];
    game.isRunning = false;
});

module.exports = router;
