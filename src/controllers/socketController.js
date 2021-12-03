// class SocketController {
//   constructor(game, io, socket) {
//     this.game = game;
//     this.io = io;
//     this.socket = socket;
//   }
//   onVote({ voterId, victimId }) {
//     this.game.useVote(voterId, victimId);
//     if (!this.game.isEveryoneVoted()) return;
//     const victim = this.game.getMostVotedUser();
//     if (!victim) return;

//     //region Is game over
//     if (victim.role === "Vampir") {
//       this.io.emit("gameOver", { msg: "Köylüler kazandı", vampire: victim });
//       return;
//     }
//     if (this.game.getUsers().length === 2 && this.game.users.some((user) => user.role === "Vampir")) {
//       this.io.emit("gameOver", {
//         msg: "Vampir kazandı",
//         vampire: this.game.getUsers().filter((user) => user.role === "Vampir")[0],
//       });
//       return;
//     }
//     this.io.emit("nightBegin", `${victim.name} ${victim.role} idam edilerek öldürüldü"`);
//     //   game.nextDay();
//     //   io.emit("gameBegin", "Gün " + game.days);
//   }

//   onReady(user) {
//     this.game.setReady(user.id);
//     if (this.game.isEveryoneReady()) {
//       this.game.assignRoles();
//       this.io.emit("gameBegin", "Gün " + this.game.days);
//     }
//     this.io.emit("updateUsers", this.game.getUsers());
//   }
// }

// module.exports = SocketController;
