const express = require("express");
const pool = require("../modules/pool");
const {
  rejectUnauthenticated,
} = require("../modules/authentication-middleware");
const { query } = require("../modules/pool");

const router = express.Router();

/**
 * GET SMALL LIST OF BARRELS
 */
router.get("/", (req, res) => {
  queryText = `SELECT * FROM barrels ORDER BY city ASC LIMIT 7`;
  pool
    .query(queryText)
    .then((result) => {
      res.send(result.rows);
    })
    .catch((error) => res.sendStatus(500));
});

/**
 * GET ALL BARRELS
 */
router.get("/admin", (req, res) => {
  queryText = `SELECT * FROM barrels ORDER BY city ASC`;
  pool
    .query(queryText)
    .then((result) => {
      res.send(result.rows);
    })
    .catch((error) => res.sendStatus(500));
});

/**
 * POST NEW BARREL LOCATION
 */
router.post("/", rejectUnauthenticated, (req, res) => {
  console.log(req.body);
  let hosts = req.body.host;
  let street = req.body.street;
  let city = req.body.city;
  let zipcode = req.body.zipcode;
  let description = req.body.description;
  let hours = req.body.hours;
  let dates = req.body.date;
  let queryText = `INSERT INTO barrels (hosts, street, city, zipcode, description, hours, dates) VALUES ($1, $2, $3, $4, $5, $6, $7);`;

  pool
    .query(queryText, [hosts, street, city, zipcode, description, hours, dates])
    .then((result) => {
      res.sendStatus(200);
    })
    .catch((error) => {
      console.log("SERVER POST ERR", error);
      res.sendStatus(500);
    });
});

/**
 * UPDATE BARREL STATUS
 */
router.put("/update/:id", rejectUnauthenticated, (req, res) => {
  let status = req.body.status;
  let id = req.body.id;
  let statusUpdater = !status;
  const queryText = `UPDATE barrels set status = $2 WHERE id = $1;`;
  pool
    .query(queryText, [id, statusUpdater])
    .then((result) => {
      res.sendStatus(200);
    })
    .catch((error) => {
      console.log("ERROR IN SERVER PUT", error);
      res.sendStatus(500);
    });
});

/**
 * EDIT BARREL
 */
router.put("/edit/:id", rejectUnauthenticated, (req, res) => {
  console.log(req.body);
  let itemToEdit = req.body.itemToEdit;
  let hosts = req.body.hosts;
  let street = req.body.street;
  let city = req.body.city;
  let description = req.body.description;
  let zipcode = req.body.zipcode;
  let dates = req.body.date;
  let hours = req.body.hours;

  const queryText = `UPDATE barrels SET (hosts, street, city, description, zipcode, hours, dates) = ($1, $2, $3, $4, $5, $6, $7) WHERE id = $8`;
  pool
    .query(queryText, [
      hosts,
      street,
      city,
      description,
      zipcode,
      hours,
      dates,
      itemToEdit,
    ])
    .then((result) => {
      res.sendStatus(200);
    })
    .catch((error) => {
      console.log("ERROR IN SERVER UPDATE", error);
    });
});

/**
 * SEARCH BARRELS
 */
router.get("/search/:search", (req, res) => {
  let searchQuery = req.params.search;
  if (searchQuery === "*all") {
    console.log("hello");
    let queryText = `SELECT * FROM barrels ORDER BY city ASC`;
    pool
      .query(queryText)
      .then((result) => {
        console.log(result.rows);
        res.send(result.rows);
      })
      .catch((error) => {
        console.log("ERROR IN SERVER SEARCH GET", error);
      });
  } else {
    console.log(searchQuery);

    const queryText = `SELECT * FROM barrels WHERE city ILIKE '%${searchQuery}%' OR hosts ILIKE '%${searchQuery}%' OR hours ILIKE '%${searchQuery}%' OR description ILIKE '%${searchQuery}%' OR zipcode LIKE '%${searchQuery}%' OR dates ILIKE '%${searchQuery}%;'`;
    pool
      .query(queryText)
      .then((result) => {
        console.log(result.rows);
        res.send(result.rows);
      })
      .catch((error) => {
        console.log("ERROR IN SERVER SEARCH GET", error);
      });
  }
});
// DELETE ITEM FROM BARREL
router.delete("/delete/:id", (req, res) => {
  let reqId = req.params.id;
  console.log("Delete request for id", reqId);
  let queryText = `DELETE FROM barrels WHERE id=$1`;
  pool
    .query(queryText, [reqId])
    .then((result) => {
      console.log("Item deleted");
      res.sendStatus(200);
    })
    .catch((error) => {
      console.log(`Error making database query ${queryText}`, error);
      res.sendStatus(500);
    });
});
module.exports = router;
