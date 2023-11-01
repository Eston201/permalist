import express from "express";
import bodyParser from "body-parser";
import pg from 'pg'

const app = express();
const port = 3000;
const db = new pg.Client({
  user: 'postgres',
  password: '',
  database: 'permalist',
  host: 'localhost',
  port: '5432'
});
await db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


app.get("/", async (req, res) => {
  const items = await getItems();
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
});

app.post("/add", async (req, res) => {
  const { newItem } = req.body;
  const itemInserted = await insertItem(newItem);
  if (!itemInserted) console.log("Item insert failed!.");
  res.redirect("/");
});

app.post("/edit", async (req, res) => {
  const { updatedItemId, updatedItemTitle } = req.body;
  const itemUpdated = await updateItem(updatedItemId, updatedItemTitle);
  if (!itemUpdated) console.error("Could not update item!.");
  res.redirect('/')
});

app.post("/delete", async (req, res) => {
  const { deleteItemId } = req.body;
  const itemDeleted = await deleteItemById(deleteItemId);
  if (!itemDeleted) console.log("Failed to delete item!.");
  res.redirect('/')
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

async function getItems() {
  try {
    const { rows: items } = await db.query("SELECT * FROM items");
    return items;
  } catch(e) {
    console.error(e);
  }
  return [];
}

async function insertItem(item) {
  try {
    const { rowCount } = await db.query(
      "INSERT INTO items (title) VALUES ($1) RETURNING id",
      [item]
    );
    return (rowCount === 1);
  } catch (e) {
    console.error(e);
  }
  return false;
}

async function updateItem(id, title) {
  try {
    const { rowCount } = await db.query(
      "UPDATE items SET title = $2 WHERE id = $1",
      [id, title]
    )
    return (rowCount === 1);
  } catch(e) {
    console.error(e);
  }
  return false;
}

async function deleteItemById(id) {
  try {
    const { rowCount } = await db.query(
      "DELETE FROM items WHERE id = $1",
      [id]
    );
    return (rowCount === 1);
  } catch (e) {
    console.error(e);
  }
  return false;
}
