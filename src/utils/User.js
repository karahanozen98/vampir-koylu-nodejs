class User {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.role = Roles.Villager;
    this.state = "Bekleniyor";
    this.votes = 0;
    this.isVoted = false;
    this.isDead = false;
    this.isReady = false;
  }
}

module.exports = User;
