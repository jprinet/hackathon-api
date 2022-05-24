const express = require('express');
const request = require('request');
const sqlite3 = require('sqlite3');

const app = express();
const db = new sqlite3.Database(':memory:');

function init(db, cb) {
    const sql = `
        CREATE TABLE IF NOT EXISTS scans
        (
            buildScanId
            TEXT,
            projectId
            TEXT,
            startTime
            TEXT,
            taskName
            TEXT,
            isCacheable
            TEXT,
            status
            TEXT
        )
    `

    db.run(sql, function (err) {
        cb(err)
    })
}

function insert(db, params, cb) {
    const sql = 'INSERT INTO scans (buildScanId, projectId, startTime, taskName, isCacheable, status) VALUES (?,?,?,?,?,?)'

    db.run(sql, params, function (err) {
        cb(err)
    })
}

function select(db, cb) {
    const sql = 'SELECT * FROM scans'

    db.get(sql, (err, result) => {
        cb(err, result)
    })
}

app.get('/scans', function (req, res) {

    //TODO get query filter

    const getBuildsRequest = {
        url: 'https://ge.solutions-team.gradle.com/api/builds?since=1649196000000',
        method: 'GET',
        json: true,
        headers: {
            'Authorization': 'Bearer zubuvlw43gh3xk3geyt5n3qbhg7vpug3jsmv32yrhdrznc7l3qga',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    };

    request(getBuildsRequest, (err, res2, body) => {
        if (err) {
            console.log(err);
            next(err)
        } else {
            console.log("id=" + body[0].id);
            console.log("tool=" + body[0].buildToolType);

            body.forEach(function(obj) {
                //TODO check if already fetched

                //TODO fetch build performance

                // TODO insert real data
                insert(db, [obj["id"],"1","1","1","1","1"], function(err) {
                    if (err) {
                        console.log(err);
                        next(err)
                    } else {
                        res.end(JSON.stringify(body));
                    }
                });
            });
        }
    });
})

app.get('/results', function (req, res) {

    //TODO get query filter

    select(db, (err, selectResult) => {
        if (err) {
            console.log(err);
            next(err)
        } else {
            res.end(JSON.stringify(selectResult));
        }
    });
})

init(db, function(err) {
    if (err) {
        console.log(err);
        next(err)
    } else {
        console.log("DB created")

        app.listen(8081, function () {
            console.log("Server ready")
        })
    }
});
