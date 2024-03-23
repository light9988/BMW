
import app from "./app.js";
import logger from './config/logger.js';

const PORT = 8000;

app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});
