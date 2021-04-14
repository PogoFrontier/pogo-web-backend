import jwt from 'jsonwebtoken';
import { firestore } from '../api/rest_server';

const generateToken = (id: string) => {
    return jwt.sign({id}, process.env.JWT_SECRET as string, {
        expiresIn: '30d'
    });
}

const protect = async (req: any, res: any, next: any) => {
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer ')){
        try{
            const token: string = req.headers.authorization.split(' ')[1];
            const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
            firestore.collection('users').doc(decoded.id).get().then(user => {
                if(user.data()){
                    req.user = user.data();
                    next();
                }else{
                    res.status(401).json({
                        message: 'Not authorized, token failed'
                    });
                    return;
                }
            });
        }catch(err){
            res.status(401).json({
                message: 'Not authorized, token failed'
            });
            return;
        }
    }else{
        res.status(401).json({
            message: 'Not authorized, no token'
        });
        return;
    }
}

export {generateToken, protect};