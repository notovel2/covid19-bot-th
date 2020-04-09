import app from "./app";
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`App is running at http://localhost:${PORT} in ${app.get("env")} mode`);
})