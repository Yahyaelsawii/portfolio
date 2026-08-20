import { purgeExpiredData } from "../functions/_shared/retention.js";

export default {
  async scheduled(_controller, env) {
    const deleted = await purgeExpiredData(env.DB);
    console.log(JSON.stringify({ event: "retention_cleanup_complete", deleted }));
  }
};
