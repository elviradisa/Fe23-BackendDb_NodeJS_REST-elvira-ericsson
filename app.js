import express from 'express';
import ejs from 'ejs';
import bodyParser from 'body-parser';
import * as db from "./db.js"

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get('/', async (req, res) => {
    const pageTitle = "Grit Academy";
    const sql = 'SHOW tables';
    const dbData = await db.query(sql);
    console.log(dbData);
    res.render('index', {pageTitle, dbData} );
});

let currentTable;
app.post('/', async (req, res) => {
    console.log(req.body);
    const tableName = req.body;
    const pageTitle = "Grit Academy";
    const sql = `SELECT * FROM ${tableName.table_name}`;
    currentTable = tableName.table_name
    const dbData = await db.query(sql);
    console.log(dbData);
    res.render('index', {pageTitle, dbData} );
});

app.get('/addStudent', async (req, res) => {
    const pageTitle = "Add Student";
    res.render('addStudent', { pageTitle });
});

app.post('/addStudent', async (req, res) => {
    const { firstName, lastName, town } = req.body;
    const sql = `INSERT INTO students (fName, lName, town) VALUES (?, ?, ?)`;
    try {
        await db.query(sql, [firstName, lastName, town]);
        res.redirect('/'); // Redirect till startsidan efter att studenten har lagts till
    } catch (error) {
        console.error("Error adding student:", error);
        res.status(500).send("Error adding student. Please try again later.");
    }
});

app.get('/removeData', async (req, res) => {
    const pageTitle = "Grit Academy";
    const sql = `SELECT * FROM ${currentTable}`;
    const dbData = await db.query(sql);
    console.log(dbData);
    res.render('removeData', {pageTitle, dbData} );
});

app.post('/removeData', async (req, res) => {
    const requestData = req.body;
    const pageTitle = "Grit Academy";
    const sqlDeleteQuery = `DELETE FROM ${currentTable} WHERE id=${requestData.id}`;
    const deleteQuery = await db.query(sqlDeleteQuery);
    console.log(deleteQuery);
    const sql = `SELECT * FROM ${currentTable}`;
    const dbData = await db.query(sql);
    const sql2 = `DESCRIBE ${currentTable}`;
    const dbDataHeaders = await db.query(sql2);
    console.log(dbDataHeaders);
    res.render('removeData', {pageTitle, dbData, dbDataHeaders} );
});

app.get('/students', async (req, res) => {
    let sql = "";
    const {id} = req.query;
    if(id){
        sql = `SELECT * FROM students WHERE id = ${id}`;
    }else{
        sql = `SELECT * FROM students`;
    }
    const dbData = await db.query(sql);
    res.json(dbData);
});

app.get('/students_courses', async (req, res) => {
    let sql = "";
    const {id} = req.query;
    if(id){
        sql = `SELECT * FROM students_courses WHERE id = ${id}`;
    }else{
        sql = `SELECT * FROM students_courses`;
    }
    const dbData = await db.query(sql);
    res.json(dbData);
});

app.get('/courses', async (req, res) => {
    let sql = "";
    const {id} = req.query;
    if(id){
        sql = `SELECT * FROM courses WHERE id = ${id}`;
    }else{
        sql = `SELECT * FROM courses`;
    }
    const dbData = await db.query(sql);
    res.json(dbData);
});

app.get("/students/:studentName/courses", async (req, res) => {
    let studentData = [req.params.studentName]
    const [result] = await db.query(
        `SELECT c.* FROM Courses c JOIN Students_Courses sc ON (c.id = sc.Courses_id) JOIN Students s ON (sc.Students_id = s.id) WHERE s.lName = "${studentData}" OR s.fName = "${studentData}" OR s.id = "${studentData}" OR s.town = "${studentData}"`
    );
    res.json(result);
});

app.get("/courses/:courseInfo", async (req, res) => {
    let coursesData = [req.params.courseInfo]
    const result = await db.query(
        `SELECT s.* FROM Students s JOIN Students_Courses sc ON (s.id = sc.Students_id) JOIN Courses c ON (sc.Courses_id = c.id) WHERE c.id = "${coursesData}" LIKE c.name = "${coursesData}"`
    );
    res.json(result);
});

app.get('/plants/:id/:col', async (req, res) => {
    let sql = `SELECT ${req.params.col} FROM plants WHERE id = ${req.params.id}`;
    const dbData = await db.query(sql);
    res.json(dbData);
});

const port = 3000;
app.listen(port, () => {
    console.log(`server is running on  http://localhost:${port}/`);
});