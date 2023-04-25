import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import Pusher from "pusher";
import mongoData from "./mongoData.js";
//app config
const app = express();
const port = 9000;
const pusher = new Pusher({
  appId: "1587926",
  key: "3f7e8cb85cbe0ced0ce2",
  secret: "5c0ba4a391d227178a19",
  cluster: "ap2",
  useTLS: true,
});
//middlewares
app.use(cors());
app.use(express.json());

//db config
const mongoURI =
  "mongodb+srv://aniruddhapw:scUQcNVgDMTS2rL0@cluster0.xpejoo2.mongodb.net/?retryWrites=true&w=majority";
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.once("open", () => {
  console.log("DB connected");

  const changeStream = mongoose.connection.collection("conversations").watch();
  changeStream.on("change", (change) => {
    if (change.operationType === "insert") {
      pusher.trigger("channels", "newChannel", {
        change: change,
      });
    } else if (change.operationType === "update") {
      pusher.trigger("conversation", "newMessage", {
        change: change,
      });
    } else {
      console.log("error triggering pusher");
    }
  });
});

//api routes
app.get("/", (req, res) => res.status(200).send("hello guyssss"));

app.post("/new/channel", (req, res) => {
  const dbData = req.body;
  mongoData
    .create(dbData)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

app.post("/new/message", (req, res) => {
  const id = req.query.id;
  const newMessage = req.body;
  mongoData
    .updateOne({ _id: id }, { $push: { conversation: newMessage } })
    .then((result) => {
      res.status(201).send(result);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

app.get("/get/channelList", (req, res) => {
  mongoData
    .find()
    .then((data) => {
      let channels = [];
      data.map((channelData) => {
        const channelInfo = {
          id: channelData._id,
          name: channelData.channelName,
        };
        channels.push(channelInfo);
      });
      res.status(200).send(channels);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

app.get("/get/conversation", (req, res) => {
  const id = req.query.id;
  mongoData
    .findOne({ _id: id })
    .then((data) => {
      if (!data) {
        res.status(404).send(`Conversation with id ${id} not found`);
      } else {
        res.status(200).send(data);
      }
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

// app.delete("/channel/:id", (req, res) => {
//   const channelId = req.params.id;
//   mongoData
//     .findByIdAndDelete(channelId)
//     .then((deletedChannel) => {
//       if (!deletedChannel) {
//         return res.status(404).send({ message: "Channel not found" });
//       }
//       res.status(204).send();
//     })
//     .catch((err) => {
//       res.status(500).send(err);
//     });
// });

//listen
app.listen(port, () => console.log(`listening on localhost :${port}`));
