const functions = require("firebase-functions");

const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);
const db = admin.database();

exports.createTestimoni = functions.https.onRequest((req, res) => {
  const text = req.query.text;
  const name = req.body.name;
  const image = req.body.image;
  const date = admin.database.ServerValue.TIMESTAMP;

  return admin
    .database()
    .ref("/testimoni")
    .push({
      beritadukaid: "2",
      message: text,
      sticker:
        "https://firebasestorage.googleapis.com/v0/b/lembar-duka.appspot.com/o/images%2Fsticker%2F31d4afb62802b8cc69a239969408b989.png?alt=media&token=d45dad08-3fd8-44b6-9984-9bf079ac9b12",
      time: date,
      user: {
        id: "ZP5c3srlTKaOXmXu5j3nnZTewrg2",
        image:
          "https://firebasestorage.googleapis.com/v0/b/lembar-duka.appspot.com/o/images%2Fimage_1547776624.jpg?alt=media&token=b2c85958-296d-4724-ba26-316cf87b8416",
        name: "hana"
      }
    })
    .then(snapshot => {
      return res.redirect(303, snapshot.ref.toString());
    });
});

exports.notifyMe = functions.database
  .ref("/testimoni/{pushId}/message")
  .onWrite((change, context) => {
    let key = context.params.pushId;
    let body = change.after.val();
    const user = db.ref(`/testimoni/${key}/user/id`);

    user.on("value", snapshot => {
      let userId = snapshot.val();
      const userData = db.ref(`/users/${userId}/notificationTokens`);

      userData.on("value", snapshot => {
        let token = snapshot.val();

        let payload = {
          notification: {
            title: "Testimoni baru",
            body: `${body}`
          }
        };

        admin
          .messaging()
          .sendToDevice(token, payload)
          .then(snapshot => {
            console.log("Notification successfully sent", snapshot);
          })
          .catch(err => {
            console.log("Something went wrong!", err);
          });
      });
    });

    return "Notification sent";
  });

exports.notifyUser = functions.database
  .ref("/testimoni/{pushId}/message")
  .onCreate((snapshot, context) => {
    let key = context.params.pushId;
    let body = snapshot.val();
    const user = db.ref(`/testimoni/${key}/user/id`);

    user.on("value", snaps => {
      let userId = snaps.val();
      const userData = db.ref(`/users/${userId}/notificationTokens`);

      userData.on("value", snapshot => {
        let token = snapshot.val();

        let payload = {
          notification: {
            title: "Testimoni Baru",
            body: `${body}`
          }
        };

        return admin
          .messaging()
          .sendToDevice(token, payload)
          .then(snapshot => {
            console.log("Notification successfully sent", snapshot);
          })
          .catch(err => {
            console.log("Something went wrong!", err);
          });
      });
    });
  });
