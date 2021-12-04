const { Server } = require("socket.io");
const game = require("./Game");
const Roles = require("./utils/Roles");

function socket(server) {
    const io = new Server(server, {
        cors: {
            //origin: "http://localhost:3000",
            origin: "*",
            methods: ["GET", "POST", "PUT"]
        }
    });

    io.on("connection", (socket) => {
        if (game.isRunning) {
            socket.emit("error", "Şuanda devam eden bir oyun var");
            socket.disconnect();
            return;
        }
        game.addConnection(socket.id);

        socket.on("login", (name) => {
            if (game.isRunning) {
                socket.emit("error", "Şuanda devam eden bir oyun var");
                return;
            }
            if (game.getUsers().find((x) => x.name === name)) {
                socket.emit("error", "Bu isim alınmış");
                return;
            }
            if (name.length < 3 || name.length > 10) {
                socket.emit("error", "İsim 3 ila 10 karakter uzunluğunda olmalı");
                return;
            }

            game.addUser(socket.id, name);
            socket.emit("loggedIn", game.getUser(socket.id));
            io.emit("updateUsers", game.getUsers());
        });

        socket.on("ready", (user) => {
            game.setReady(user.id);
            if (game.isEveryoneReady()) {
                game.assignRoles();
                io.emit("gameBegin", {
                    msg: "Gün " + game.days,
                    users: game.getUsers()
                });
            } else {
                io.emit("updateUsers", game.getUsers());
            }
        });

        socket.on("vote", ({ voterId, victimId }) => {
            game.useVote(voterId, victimId);
            io.emit("updateUsers", game.getUsers());
            if (!game.isEveryoneVoted()) return;
            const victim = game.getMostVotedUser();
            if (!victim) return;

            game.executeVictim(victim);

            io.emit("updateUsers", game.getUsers());

            // Is game over
            if (victim.role === Roles.Vampire) {
                io.emit("gameOver", { msg: "Köylüler kazandı", vampire: victim });
                game.isRunning = false;
                return;
            }
            if (
                game.getAliveUsers().length <= 2 &&
                game.getAliveUsers().some((user) => user.role === Roles.Vampire)
            ) {
                io.emit("gameOver", {
                    msg: "Vampir kazandı",
                    vampire: game.getUsers().filter((user) => user.role === Roles.Vampire)[0]
                });
                game.isRunning = false;
                return;
            }
            io.emit("nightBegin", {
                msg: `${victim.name} adlı ${victim.role.toLowerCase()} idam edilerek öldürüldü"`,
                users: game.getUsers()
            });
        });

        socket.on("villagerReadyForNight", (userId) => {
            const user = game.getUser(userId);
            if (!user || user.isDead) return;

            setUserReady(user);
        });

        socket.on("docReadyForNight", ({ doctorId, userId }) => {
            const doctor = game.getUser(doctorId);
            const user = game.getUser(userId);
            if (!doctor || !user || doctorId === userId || doctor.role !== "Doktor") return;
            const oldProtected = game.getTheProtected();
            if (oldProtected) {
                oldProtected.isProtected = false;
            }
            user.isProtected = true;
            console.log(doctor + " " + user + "kişisini korudu");
            setUserReady(doctor);
        });

        socket.on("vampireReadyForNight", ({ vampireId, userId }) => {
            const vampire = game.getUser(vampireId);
            const user = game.getUser(userId);
            if (!vampire || !user || vampireId === userId || vampire.role !== "Vampir") return;
            const oldVictim = game.getTheVictim();
            if (oldVictim) {
                oldVictim.isTheVictim = false;
            }
            user.isTheVictim = true;
            setUserReady(vampire);
        });

        socket.on("disconnect", () => {
            console.log("User disconnect", socket.id);
            game.removeUser(socket.id);
            game.removeConnection();
            if (io.sockets.sockets.size <= 0) {
                game.isRunning = false;
            }
            io.emit("updateUsers", game.getUsers());
        });

        function setUserReady(user) {
            user.isReady = true;
            io.emit("updateUsers", game.getUsers());
            const isEveryoneReady = game.getAliveUsers().every((user) => user.isReady === true);
            if (!isEveryoneReady) return;
            const victim = game.getTheVictim();
            const protected = game.getTheProtected();

            if (victim.id === protected.id) {
                game.nextDay();
                io.emit("gameBegin", {
                    msg: "Yeni bir güne başlandı kimse ölmedi",
                    users: game.getUsers()
                });
            } else {
                victim.isDead = true;
                if (
                    game.getAliveUsers().length <= 2 &&
                    game.getAliveUsers().some((user) => user.role === "Vampir")
                ) {
                    io.emit("gameOver", {
                        msg: "Vampir kazandı",
                        vampire: game.getUsers().filter((user) => user.role === "Vampir")[0]
                    });
                    game.isRunning = false;
                    return;
                } else
                    io.emit("gameBegin", {
                        msg: `Yeni bir güne başlandı gece ${
                            victim.name
                        } adlı ${victim.role.toLowerCase()} öldü!`,
                        users: game.getUsers()
                    });
            }
        }
    });
}

module.exports = socket;
