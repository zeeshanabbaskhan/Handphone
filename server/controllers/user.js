const user = require('../models/user');
const { generateToken } = require('../services/authentication');
const bcrypt = require('bcrypt');
const cloudinary = require('../services/cloudinary');


async function registerUser(req, res) {

    const { name, email, password, } = req.body;
    try {

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        const existingUser = await user.findOne({ email: email });

        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        const newUser = (await user.create({ name, email, password }));
        let userWithoutPassword = newUser.toObject()
        delete userWithoutPassword.password
        await generateToken(userWithoutPassword, res);
        res.json({
            success: true,
            message: "User registered successfully",
            user: userWithoutPassword
        });
    }
    catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

async function loginUser(req, res) {



    const { email, password } = req.body;
    try {

        const findeduser = await user.findOne({ $or: [{ email: email }, { username: email }] }).select('+password');;
        if (!findeduser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        const isPasswordValid = await bcrypt.compare(password, findeduser.password);

        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: "Invalid password" });
        }
        let userWithoutPassword = findeduser.toObject()
        delete userWithoutPassword.password
        await generateToken(findeduser, res);



        res.json({ success: true, message: "Login successful", user: userWithoutPassword })
    }
    catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}

async function updateuser(req, res) {

    console.log(req.body);


    let profileImg;
    let name;
    let email;
    let phone;
    let address;
    try {

        if (req.files) {

            const base64Image = `data:${req.files.image.mimetype};base64,${req.files.image.data.toString('base64')}`;
            const uploadResponse = await cloudinary.uploader.upload(base64Image, {
                resource_type: 'auto',
                folder: 'profile_pics',
                public_id: req.user._id,
            });
            profileImg = uploadResponse.secure_url;
            console.log(profileImg);
        }


        if (req.body.name) {
            name = req.body.name
        }
        if (req.body.email) {
            email = req.body.email
        }
        if (req.body.phone) {
            phone = req.body.phone
        }
        if (req.body.address) {
            address = req.body.address
        }


        const updatedUser = await user.findByIdAndUpdate(req.user._id, { name, email, phone, profileImg, address }, { new: true });

        let userWithoutPassword = updatedUser.toObject()
        delete userWithoutPassword.password

        res.json({
            message: "User updated successfully",
            user: userWithoutPassword
        });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}

async function logout(req, res) {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
    });

    res.status(200).json({ success: true, message: 'Logged out successfully' });

}

async function check(req, res) {
    try {
        res.json({ success: true, message: "Authorization Successfull", user: req.user })

    } catch (error) {
        console.error("Error in check autorization controller:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        }
        )
    }
}

async function getusersforsidebar(req, res) {
    try {
        const gettingusers = await user.find({ _id: { $ne: req.user._id } })

        res.json({ success: true, users: gettingusers })
    } catch (error) {
        console.log(error);

    }
}



async function admin(req, res) {
    const normalizedBody = Object.fromEntries(
        Object.entries(req.body || {}).map(([key, value]) => [
            typeof key === 'string' ? key.trim().toLowerCase() : key,
            value
        ])
    );

    const pickValue = (value) => Array.isArray(value) ? value[0] : value;

    const name = String(pickValue(normalizedBody.name || '')).trim();
    const email = String(pickValue(normalizedBody.email || '')).trim().toLowerCase();
    const password = String(pickValue(normalizedBody.password || ''));
    const roleInput = String(pickValue(normalizedBody.role || 'admin')).trim().toLowerCase();
    const role = roleInput === 'admin' ? 'admin' : 'customer';

    console.log(`Registering user with name: ${name || 'undefined'}, email: ${email || 'undefined'}, role: ${role}`);
    try {

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "name, email and password are required"
            });
        }

        const existingUser = await user.findOne({ email: email });

        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        const newUser = (await user.create({ name, email, password, role }));
        let userWithoutPassword = newUser.toObject()
        delete userWithoutPassword.password
        await generateToken(userWithoutPassword, res);
        res.json({
            success: true,
            message: "User registered successfully",
            user: userWithoutPassword
        });
    }
    catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }

}

// Add these new functions to your existing controller

async function getAllCustomers(req, res) {
    try {
        const customers = await user.find({ role: 'customer' })
            .select('-password')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            message: "Customers retrieved successfully",
            customers: customers,
            totalCustomers: customers.length
        });
    } catch (error) {
        console.error("Error getting customers:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

async function getCustomerById(req, res) {
    try {
        const { customerId } = req.params;

        const customer = await user.findById(customerId).select('-password');

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        res.json({
            success: true,
            message: "Customer retrieved successfully",
            customer: customer
        });
    } catch (error) {
        console.error("Error getting customer:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

async function updateCustomer(req, res) {
    try {
        const { customerId } = req.params;
        const updateData = req.body;

        // Remove sensitive fields from update
        delete updateData.password;
        delete updateData.role;

        const updatedCustomer = await user.findByIdAndUpdate(
            customerId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedCustomer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        // Update average order value if needed
        if (updateData.totalOrders || updateData.totalSpent) {
            updatedCustomer.updateAverageOrderValue();
            await updatedCustomer.save();
        }

        res.json({
            success: true,
            message: "Customer updated successfully",
            customer: updatedCustomer
        });
    } catch (error) {
        console.error("Error updating customer:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

async function deleteCustomer(req, res) {
    try {
        const { customerId } = req.params;

        const deletedCustomer = await user.findByIdAndDelete(customerId);

        if (!deletedCustomer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        res.json({
            success: true,
            message: "Customer deleted successfully",
            deletedCustomer: {
                id: deletedCustomer._id,
                name: deletedCustomer.name,
                email: deletedCustomer.email
            }
        });
    } catch (error) {
        console.error("Error deleting customer:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

async function getCustomerStats(req, res) {
    try {
        const totalCustomers = await user.countDocuments({ role: 'customer' });
        const vipCustomers = await user.countDocuments({ role: 'customer', segment: 'vip' });
        const activeCustomers = await user.countDocuments({ role: 'customer', status: 'active' });

        // Calculate average lifetime value
        const customerStats = await user.aggregate([
            { $match: { role: 'customer' } },
            {
                $group: {
                    _id: null,
                    avgLifetimeValue: { $avg: '$totalSpent' },
                    totalRevenue: { $sum: '$totalSpent' },
                    totalOrders: { $sum: '$totalOrders' }
                }
            }
        ]);

        const stats = customerStats[0] || {
            avgLifetimeValue: 0,
            totalRevenue: 0,
            totalOrders: 0
        };

        res.json({
            success: true,
            message: "Customer statistics retrieved successfully",
            stats: {
                totalCustomers,
                vipCustomers,
                activeCustomers,
                activeRate: totalCustomers > 0 ? ((activeCustomers / totalCustomers) * 100).toFixed(1) : 0,
                avgLifetimeValue: stats.avgLifetimeValue || 0,
                totalRevenue: stats.totalRevenue || 0,
                totalOrders: stats.totalOrders || 0
            }
        });
    } catch (error) {
        console.error("Error getting customer stats:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

async function searchCustomers(req, res) {
    try {
        const { search, segment, status, page = 1, limit = 10 } = req.query;

        let query = { role: 'customer' };

        // Add search filter
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        // Add segment filter
        if (segment && segment !== 'all') {
            query.segment = segment;
        }

        // Add status filter
        if (status && status !== 'all') {
            query.status = status;
        }

        const skip = (page - 1) * limit;

        const customers = await user.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalCount = await user.countDocuments(query);

        res.json({
            success: true,
            message: "Customers search completed",
            customers,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCount / limit),
                totalCount,
                hasNext: skip + customers.length < totalCount,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error("Error searching customers:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

async function sendEmailToCustomer(req, res) {
    try {
        const { customerId } = req.params;
        const { subject, message } = req.body;

        if (!subject || !message) {
            return res.status(400).json({
                success: false,
                message: "Subject and message are required"
            });
        }

        const customer = await user.findById(customerId).select('name email');

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        // Here you would integrate with your email service (SendGrid, Nodemailer, etc.)
        // For now, we'll just simulate sending an email
        console.log(`Sending email to ${customer.email}`);
        console.log(`Subject: ${subject}`);
        console.log(`Message: ${message}`);

        // TODO: Implement actual email sending logic here
        // Example with nodemailer:
        // await sendEmail({
        //     to: customer.email,
        //     subject: subject,
        //     html: message
        // });

        res.json({
            success: true,
            message: `Email sent successfully to ${customer.name}`,
            emailDetails: {
                to: customer.email,
                subject: subject,
                sentAt: new Date()
            }
        });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

// Update the module.exports to include the new functions
module.exports = {
    registerUser,
    loginUser,
    updateuser,
    check,
    logout,
    getusersforsidebar,
    admin,
    getAllCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer,
    getCustomerStats,
    searchCustomers,
    sendEmailToCustomer
};


