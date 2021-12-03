const User = require("./utils/User");
const Roles = require("./utils/Roles");

class Game {
  constructor() {
    this.users = [];
    this.connections = [];
    this.days = 1;
    this.isRunning = false;
  }

  addConnection = () => this.connected++;
  removeConnection = (id) => this.connections.push(id);
  getUsers = () => this.users;
  getAliveUsers = () => this.users.filter((x) => x.isDead === false);
  getTheVictim = () => this.users.find((user) => user.isTheVictim);
  getTheProtected = () => this.users.find((user) => user.isProtected);
  addUser = (id, name) => this.users.push(new User(id, name));
  removeUser = (id) => (this.users = this.users.filter((user) => user.id !== id));

  getUser(id) {
    return this.users.find((user) => user.id === id);
  }

  setReady(id) {
    const user = this.users.filter((user) => user.id === id);
    if (user) {
      user[0].state = "Hazır";
    }
  }

  killUser(id) {
    const user = this.getUser(id);
    user.isDead = true;
  }

  isEveryoneReady() {
    if (this.users.length <= 2) return false;
    const waiters = this.users.some((user) => user.state === "Bekleniyor");
    if (waiters) return false;
    else return true;
  }

  assignRoles() {
    let userList = [...this.users];
    const doctorIndex = Math.floor(Math.random() * userList.length);
    const doctor = userList[doctorIndex];
    doctor.role = Roles.Doctor;

    userList = userList.filter((x) => x.id !== doctor.id);
    const vampireIndex = Math.floor(Math.random() * userList.length);
    const vampire = userList[vampireIndex];
    vampire.role = Roles.Vampire;

    userList.splice(doctorIndex, 0, doctor);

    this.users = userList;
    this.isRunning = true;
  }

  useVote(voterId, victimId) {
    if (voterId === victimId) return;
    const voter = this.getUser(voterId);
    const victim = this.getUser(victimId);

    if (!voter || !victim) {
      return;
    }

    if (voter.isVoted) {
      const oldVictim = this.getUser(voter.votedTo);
      oldVictim.votes--;
    }

    voter.isVoted = true;
    voter.votedTo = victimId;
    victim.votes++;
    console.log("Bir kullanıcı oy kullandı:" + voter.name + " -> " + victim.name);
  }

  isEveryoneVoted() {
    const unvoted = this.getAliveUsers().some((x) => x.isVoted !== true && x.isDead !== true);
    if (unvoted) return false;
    return true;
  }

  getMostVotedUser() {
    let max = 0;
    let mostVoted = this.users[0];

    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i].votes > max) {
        max = this.users[i].votes;
        mostVoted = this.users[i];
      }
    }
    // check for any other user with same vote count
    const check = this.users.filter((user) => user.id !== mostVoted.id && user.votes >= mostVoted.votes);
    if (check.length > 0) return null;
    return mostVoted;
  }
  nightBegin() {
    this.users = this.users.map((user) => {
      return { ...user, isReady: false };
    });
  }
  nextDay() {
    this.users = this.users.map((user) => {
      return {
        ...user,
        role: Roles.Villager,
        isVoted: false,
        votes: 0,
        votedTo: null,
        isTheVictim: false,
        isProtected: false,
        isReady: false,
      };
    });
    this.days++;
  }
}
module.exports = new Game();
