const express = require("express");
const {engine} = require("express-handlebars");
const app = express();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const ARCHIVO_PELICULAS = path.join(__dirname, "data", "peliculas.json");

function cargarPeliculas() {
    try {
        if (!fs.existsSync(ARCHIVO_PELICULAS)) {
            return [];
        }
        const contenido = fs.readFileSync(ARCHIVO_PELICULAS, "utf-8");
        return JSON.parse(contenido);
    } catch (error) {
        console.error("Error leyendo peliculas.json:", error.message);
        return [];
    }
}

function guardarPeliculas(peliculas) {
    fs.writeFileSync(
        ARCHIVO_PELICULAS,
        JSON.stringify(peliculas, null, 2), "utf-8"
    );
}

app.engine("hbs", engine( {
    extname: ".hbs",
    defaultLayout: "main"
}));

app.set("view engine", "hbs");
app.set("views", "./views");

app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));

const storage = multer.diskStorage( {
    destination: (req, file, cb) => {
        cb(null, "public/uploads");
    },
    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname);
        const nombreUnico = Date.now() + "-" + Math.round(Math.random() * 1e6) + extension;
        cb(null, nombreUnico);  
    }
});

const upload = multer({storage});

let peliculas = cargarPeliculas();

app.get("/inicio", (req, res) => {
    res.render("inicio", {
        titulo: "Inicio"
    });
});

app.get("/peliculas/nueva", (req, res) => {
    res.render("nueva", {
        titulo: "Agregar Película"
    });
});

app.post("/peliculas", upload.single("foto"), (req, res) => {
    const {titulo, director, genero, duracion, estreno} = req.body;

    const foto= req.file ? "/uploads/" + req.file.filename : null;

    peliculas.push( {
        titulo: titulo,
        director: director,
        genero: genero,
        duracion: duracion,
        estreno: estreno,
        foto: foto
    });
    
    guardarPeliculas(peliculas);
    res.redirect("/peliculas");
});

app.get("/peliculas", (req, res) => {
    res.render("peliculas", {
        titulo: "Lista de Películas",
        peliculas: peliculas
    });
});

app.listen(3000, () => {
    console.log("Servidor iniciado correctamente");
});
