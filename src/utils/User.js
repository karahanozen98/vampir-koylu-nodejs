const Roles = require("./Roles");

class User {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.role = Roles.Villager;
    this.state = false;
    this.votes = 0;
    this.isVoted = false;
    this.isDead = false;
    this.isReady = false;
  }
}

module.exports = User;
