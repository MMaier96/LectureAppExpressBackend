var router = require('express').Router();
var ical2json = require('ical2json');
var moment = require('moment-timezone');

var axios = require('axios');

const urlStart = 'http://ics.mosbach.dhbw.de/ics/'
const fileEnding = '.ics'

router.param('course', function (req, res, next, course) {
    const url = urlStart + course + fileEnding;
    axios({
        method: 'get',
        url: url,
        responseType: 'document'
    })
        .then(d => {
            var courseCalendar = ical2json.convert(d.data).VCALENDAR[0].VEVENT

            var lecturesJSON = [];

            courseCalendar.forEach(lecture => {
                if (lecture.hasOwnProperty("SUMMARY"))
                    lecturesJSON.push({
                        UID: lecture.UID,
                        Location: lecture.LOCATION,
                        Description: lecture.DESCRIPTION,
                        Summary: lecture.SUMMARY,
                        OrganisationDay: moment(lecture["DTSTART;TZID=Europe/Berlin"]).startOf('day').unix()*1000,
                        Start: moment(lecture["DTSTART;TZID=Europe/Berlin"]).tz("Europe/Berlin").unix()*1000,
                        End: moment(lecture["DTEND;TZID=Europe/Berlin"]).tz("Europe/Berlin").unix()*1000,
                        Creation: moment(lecture["CREATED"]).tz("Europe/Berlin").unix()*1000,
                        LastModified: moment(lecture["LAST-MODIFIED"]).tz("Europe/Berlin").unix()*1000
                    })
            });

            lecturesJSON.sort((a, b) => parseFloat(a.Start) - parseFloat(b.Start));

            req.lectures = lecturesJSON
            return next();
        })
        .catch(next);
});

// return a list of lectures for a course
router.get('/:course', function (req, res, next) {
    if (req.lectures) {
        return res.json(req.lectures)
    } else {
        return res.json({ 'Error': 'No Course selected.' })
    }
});

// return a list of lectures for a course mapped to the day
router.get('/byDay/:course', function (req, res, next) {
    if (req.lectures) {
        var lecturesByDay = req.lectures.groupBy('OrganisationDay') 
        return res.json(lecturesByDay)
    } else {
        return res.json({ 'Error': 'No Course selected.' })
    }
});

module.exports = router;
