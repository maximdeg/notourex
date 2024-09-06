module.exports = fn => {
    const func = (req, res, next) => {
        fn(req, res, next).catch(next);
    };

    return func;
};
