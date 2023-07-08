const request = require("request");

const fetchMyIP = function (callback) {
  request(
    `https://api.ipify.org?format=json`,
    function (error, response, body) {
      if (error) {
        callback(error, null);
        return;
      }
      if (response.statusCode !== 200) {
        const msg = `Status Code ${response.statusCode} when fetching IP. Response: ${body}`;
        return callback(Error(msg), null);
      }

      const data = JSON.parse(body);

      return callback(null, data.ip);
    }
  );
};

const fetchCoordsByIP = function (ip, callback) {
  request(`http://ipwho.is/${ip}`, function (error, response, body) {
    if (error) {
      callback(error, null);
      return;
    }
    const data = JSON.parse(body);

    if (!data.success) {
      const msg = `Error: Success status was ${data.success}. Server message says: ${data.message} when fetching for IP ${data.ip}`;
      return callback(msg, null);
    }

    const coordinates = {
      latitude: data.latitude,
      longitude: data.longitude,
    };
    return callback(null, coordinates);
  });
};

const fetchISSFlyOverTimes = function (coords, callback) {
  const url = `https://iss-flyover.herokuapp.com/json/?lat=${coords.latitude}&lon=${coords.longitude}`;

  request(url, (error, response, body) => {
    if (error) {
      callback(error, null);
      return;
    }

    if (response.statusCode !== 200) {
      callback(
        Error(
          `Status Code ${response.statusCode} when fetching ISS pass times: ${body}`
        ),
        null
      );
      return;
    }

    const passes = JSON.parse(body).response;
    callback(null, passes);
  });
};

const nextISSTimesForMyLocation = function (callback) {
  fetchMyIP((error, ip) => {
    if (error) {
      return callback(error, null);
    }

    fetchCoordsByIP(ip, (error, loc) => {
      if (error) {
        return callback(error, null);
      }

      fetchISSFlyOverTimes(loc, (error, nextPasses) => {
        if (error) {
          return callback(error, null);
        }

        callback(null, nextPasses);
      });
    });
  });
};

module.exports = {
  fetchMyIP,
  fetchCoordsByIP,
  fetchISSFlyOverTimes,
  nextISSTimesForMyLocation,
};
