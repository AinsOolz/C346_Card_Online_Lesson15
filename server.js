// include required packages
const express = require('express');
const cors = require("cors");
const mysql = require('mysql2/promise');
require('dotenv').config();
const port = 3000;

// app.use(express.json());

//database config info
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 50,
    queueLimit: 0,
};

//initialize Express App
const app = express();
//allow app read Json
app.use(express.json());

const pool = mysql.createPool(dbConfig);

//Server Start
app.listen(port, () => {
    console.log('Server running on port', port);
});


const allowedOrigins = [
    "http://localhost:3000",
    "https://c346-card-online-lesson15.onrender.com",
    "https://card-app-starter-os64.onrender.com"]

const DEMO_USER = { id: 1, username: "admin", password: "admin123" };

app.use(
    cors({
        origin: function (origin, callback) {
            // allow requests with no origin (Postman/server-to-server)
            if (!origin) return callback(null, true);

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error("Not allowed by CORS"));
        },
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: false,
    })
);


//Example Route: Get all cards
app.get('/allcards', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM cards');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error for allcards' })
    }
});

// Example Route: Create new card
app.post('/addcard', async (req, res) => {
    const { card_name, card_image } = req.body;

    try {
        await pool.execute('INSERT INTO cards (card_name, card_image) VALUES (?, ?)', [card_name, card_image]);
        res.status(201).json({ message: 'Card ' + card_name + ' added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error - could not add card ' + card_name });
    }
});


// Example Route: Delete Card
app.delete('/deletecard/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.execute('DELETE FROM cards WHERE id =' + id);
        res.status(201).json({ message: 'Card ' + id + ' deleted successfully' })
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error - could not delete card ' + id })
    }
})

// Example Route:
app.put('/updatecard/:id', async (req, res) => {
    const { id } = req.params
    const { card_name, card_image } = req.body;
    try {
        await pool.execute('UPDATE cards SET card_name=?, card_image=? WHERE id=?', [card_name, card_image, id]);
        res.status(201).json({ message: 'Card ' + card_name + ' updated successfully' })
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error - could not update card ' + card_name })
    }
})

const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (username !== DEMO_USER.username || password !== DEMO_USER.password) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
        { userId: DEMO_USER.id, username: DEMO_USER.username },
        JWT_SECRET,
        { expiresIn: "1h" }
    );

    res.json({ token });
});

function requireAuth(req, res, next) {
    const header = req.headers.authorization; // "Bearer <token>"
    if (!header) return res.status(401).json({ error: "Missing Authorization header" });

    const [type, token] = header.split(" ");
    if (type !== "Bearer" || !token) {
        return res.status(401).json({ error: "Invalid Authorization format" });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload;
        next();
    } catch {
        return res.status(401).json({ error: "Invalid/Expired token" });
    }
}

// Protect only ONE route for this demo
app.post("/addcard", requireAuth, async (req, res) => {
    // existing addcard logic (same as before)
});









// //Lesson 16
// app.get('/allmangas',async (req,res) => {
//     try {
//         let connection = await mysql.createConnection(dbConfig);
//         const [rows] = await connection.execute('SELECT * FROM defaultdb.manga');
//         res.json(rows);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({message: 'Server error - could not view manga'})
//     }
// })

// app.post('/addmangas', async (req,res) => {
//     const {manga_name, manga_author, manga_status} = req.body;
//     try {
//         let connection = await mysql.createConnection(dbConfig)
//         await connection.execute('INSERT INTO manga (manga_name, manga_author, manga_status) VALUES (?, ?, ?)', [manga_name, manga_author, manga_status]);
//         res.status(201).json({message: 'Manga '+manga_name+' added'})
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({message: 'Server error - could not add manga '+manga_name})
//     }
// })

// app.put('/updatemanga/:id', async (req, res) => {
//     const mangaId = req.params.id;
//     const { manga_name, manga_author, manga_status } = req.body;

//     try {
//         let connection = await mysql.createConnection(dbConfig);
//         await connection.execute('UPDATE manga SET manga_name = ?, manga_author = ?, manga_status = ? WHERE idmanga = ?', [manga_name, manga_author, manga_status, mangaId]
//         );

//         res.json({ message: 'Manga updated successfully' });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: 'Server error - could not update manga' });
//     }
// });

// // Delete manga by ID
// app.delete('/deletemanga/:id', async (req, res) => {
//     const mangaId = req.params.id;

//     try {
//         let connection = await mysql.createConnection(dbConfig);
//         await connection.execute('DELETE FROM manga WHERE idmanga = ?', [mangaId]
//         );

//         res.json({ message: 'Manga deleted successfully' });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: 'Server error - could not delete manga' });
//     }
// });