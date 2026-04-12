export function setCorsHeaders(res, origin = "*") {
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET,OPTIONS,PATCH,DELETE,POST,PUT",
    );
    res.setHeader(
        "Access-Control-Allow-Headers",
        "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
    );
}

export function handleCors(req, res, origin = "*") {
    setCorsHeaders(res, origin);

    if (req.method === "OPTIONS") {
        res.status(200).end();
        return true;
    }
    return false;
}
