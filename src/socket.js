const { Server } = require("socket.io");
const game = require("./Game");

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
            socket.disconnect();
            return;
        }
        console.log("A user connected " + socket.id);
        game.addConnection(socket.id);

        socket.on("login", (name) => {
            if (game.isRunning) return;
            console.log(`Bir kullanıcı lobiye bağlandı ${name}`);
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
                    users: game.getAliveUsers()
                });
            } else {
                io.emit("updateUsers", game.getUsers());
            }
        });

        socket.on("vote", ({ voterId, victimId }) => {
            game.useVote(voterId, victimId);
            io.emit("updateUsers", game.getAliveUsers());
            if (!game.isEveryoneVoted()) return;
            const victim = game.getMostVotedUser();
            if (!victim) return;
            victim.isDead = true;
            io.emit("updateUsers", game.getAliveUsers());

            // Is game over
            if (victim.role === "Vampir") {
                io.emit("gameOver", { msg: "Köylüler kazandı", vampire: victim });
                game.isRunning = false;
                return;
            }
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
            }
            io.emit("nightBegin", {
                msg: `${victim.name} ${victim.role} idam edilerek öldürüldü"`,
                users: game.getAliveUsers()
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

            user.isProtected = true;
            console.log(doctor + " " + user + "kişisini korudu");
            setUserReady(doctor);
        });

        socket.on("vampireReadyForNight", ({ vampireId, userId }) => {
            const vampire = game.getUser(vampireId);
            const user = game.getUser(userId);
            if (!vampire || !user || vampireId === userId || vampire.role !== "Vampir") return;

            user.isTheVictim = true;
            console.log(vampire + " " + user + "kişisini öldürecek");
            setUserReady(vampire);
        });

        socket.on("disconnect", () => {
            console.log("User disconnect", socket.id);
            game.removeUser(socket.id);
            game.removeConnection();
            io.emit("updateUsers", game.getUsers());
        });

        function setUserReady(user) {
            user.isReady = true;
            console.log(user?.name + "hazir verdi");
            const isEveryoneReady = game.getAliveUsers().every((user) => user.isReady === true);
            if (!isEveryoneReady) return;
            const victim = game.getTheVictim();
            const protected = game.getTheProtected();

            console.log("Victim: " + victim?.name);
            console.log("Protected: " + protected?.name);

            if (victim?.id === protected?.id) {
                game.nextDay();
                io.emit("gameBegin", {
                    msg: "Yeni bir güne başlandı kimse ölmedi" + game.days,
                    users: game.getAliveUsers()
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
                        msg: `Yeni bir güne başlandı gece ${victim.name} öldü!`,
                        users: game.getAliveUsers()
                    });
            }
        }
    });
}

module.exports = socket;
