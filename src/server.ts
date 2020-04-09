import app from "./app";
import { createRichMenu } from "./services/line";
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`App is running at http://localhost:${PORT} in ${app.get("env")} mode`);
})