export const asyncHanndler = (Api) => {
    return (req, res, next) => {
        Api(req, res, next).catch((error)=>{
            console.log(error)
            return res.status(500).json({ message: 'Fail' })
        })
    };
};