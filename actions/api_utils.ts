import jwt from 'jsonwebtoken';
import { firestore } from "../firestore/firestore";
import { User } from '../types/user'

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
            checkToken(token, (user) => {
                req.user = user;
                next();
            }, () => res.status(401).json({
                message: 'Not authorized, token failed'
            }))
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

const checkToken = async (token: string, validCallback: (user: User) => void, invalidCallback: () => void) => {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
    firestore.collection('users').doc(decoded.id).get().then(user => {
        if (user.data()) {
            validCallback(user.data() as User)
        } else {
            invalidCallback()
        }
    });
}

export {generateToken, protect, checkToken};