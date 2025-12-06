import jwt from 'jsonwebtoken'

const authAdmin=async(req,res,next)=>{
    try{
        const {atoken}=req.headers
        
        if(!atoken){
            console.log('No token provided in headers');
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        try {
            const decoded = jwt.verify(atoken, process.env.JWT_SECRET);
            console.log('Decoded token:', decoded);

            if (decoded !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
                console.log('Token verification failed');
                return res.status(401).json({
                    success: false,
                    message: 'Invalid authentication token'
                });
            }

            next();
        } catch (tokenError) {
            console.error('Token verification error:', tokenError);
            return res.status(401).json({
                success: false,
                message: 'Invalid token format'
            });
        }

    }catch(error){
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error in authentication'
        });
    }
}

export default authAdmin