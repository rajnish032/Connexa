import mongoose from "mongoose";

const connectDB = async () => {
  //console.log(process.env.DB_CONNECTION_SECRET);
  await mongoose.connect(process.env.DB_CONNECTION_SECRET);
};

export default connectDB;