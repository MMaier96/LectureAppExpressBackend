var router = require('express').Router();
var ical2json = require('ical2json');
var moment = require('moment-timezone');

var axios = require('axios');

url = "https://www.google.com/calendar/ical/asta.dhbw.de_08mkcuqcrppq8cg8vlutdsgpjg%40group.calendar.google.com/public/basic"

// return a list of events
router.get('/', function (req, res, next) {
    axios({
        method: 'get',
        url: url,
        responseType: 'document'
    })
        .then(d => {
            var eventsJSON = [];

            var eventsCalendar = ical2json.convert(d.data).VCALENDAR[0].VEVENT

            eventsCalendar.forEach(event => {
                if (event.SUMMARY !== "")
                    eventsJSON.push({
                        UID: event.UID,
                        Location: event.LOCATION,
                        Description: event.DESCRIPTION,
                        Summary: event.SUMMARY,
                        OrganisationDay: moment(event["DTSTART;TZID=Europe/Berlin"]).startOf('day').unix() * 1000,
                        Start: moment(event["DTSTART;TZID=Europe/Berlin"]).tz("Europe/Berlin").unix() * 1000,
                        End: moment(event["DTEND;TZID=Europe/Berlin"]).tz("Europe/Berlin").unix() * 1000,
                        Creation: moment(event["CREATED"]).tz("Europe/Berlin").unix() * 1000,
                        LastModified: moment(event["LAST-MODIFIED"]).tz("Europe/Berlin").unix() * 1000
                    })
            });

            return res.json(eventsJSON)
        })
        .catch(next);
});

// return a list of events for a course mapped to the day
router.get('/byDay', function (req, res, next) {
    axios({
        method: 'get',
        url: url,
        responseType: 'document'
    })
        .then(d => {
            var eventsJSON = [];

            var eventsCalendar = ical2json.convert(d.data).VCALENDAR[0].VEVENT

            eventsCalendar.forEach(event => {
                if (event.SUMMARY !== "")
                    eventsJSON.push({
                        UID: event.UID,
                        Location: event.LOCATION,
                        Description: event.DESCRIPTION,
                        Summary: event.SUMMARY,
                        OrganisationDay: moment(event["DTSTART;TZID=Europe/Berlin"]).startOf('day').unix() * 1000,
                        Start: moment(event["DTSTART;TZID=Europe/Berlin"]).tz("Europe/Berlin").unix() * 1000,
                        End: moment(event["DTEND;TZID=Europe/Berlin"]).tz("Europe/Berlin").unix() * 1000,
                        Creation: moment(event["CREATED"]).tz("Europe/Berlin").unix() * 1000,
                        LastModified: moment(event["LAST-MODIFIED"]).tz("Europe/Berlin").unix() * 1000
                    })
            });

            var eventsByDay = eventsJSON.groupBy('OrganisationDay')
            return res.json(eventsByDay)
            
        })
        .catch(next);
});

module.exports = router;
