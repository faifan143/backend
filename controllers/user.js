import pool from "../database.js";

export const updateCords = async (req, res) => {
    try {
        const { email, latitude, longitude } = req.body;

        const [rows, fields] = await pool.query(
            `UPDATE customers SET cust_latitude = ?, cust_longitude = ? WHERE cust_email = ?`,
            [latitude, longitude, email]
        );
        if (rows.affectedRows > 0) {
            return res.status(200).json({ state: 'success' });
        } else {
            return res.status(400).json({ state: 'fail', message: 'Failed to update coordinates' });
        }
    } catch (error) {
        console.error('Error updating coordinates:', error);
        return res.status(500).json({ state: 'error', message: error });
    }
};

export const update_info = async (req, res) => {
    try {
        const { email, name , address , phone  } = req.body;
        const picture = req.file;

        if(!picture){
            const [rows, fields] = await pool.query(
                `UPDATE customers SET cust_name = ? , cust_address = ?  WHERE cust_email = ?`,
                [name, address,phone, email]
            );
            if (rows.affectedRows > 0) {
                return res.status(200).json({ state: 'success' });
            } else {
                return res.status(400).json({ state: 'fail', message: 'Failed to update info' });
            }
        }else{
            const [rows, fields] = await pool.query(
                `UPDATE customers SET cust_picture = ? , cust_name = ? , cust_address = ? , cust_phone = ?  WHERE cust_email = ?`,
                [ picture.originalname , name, address,phone, email]
            );
            if (rows.affectedRows > 0) {
                return res.status(200).json({ state: 'success' });
            } else {
                return res.status(400).json({ state: 'fail', message: 'Failed to update cinfo' });
            }
        }

        
    } catch (error) {
        console.error('Error updating info:', error);
        return res.status(500).json({ state: 'error', message: error });
    }
};

export const getShops = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            select s.*, sub_name, shop_photo
            from shops s 
            inner join shop_sub ss on s.shop_id = ss.shop_id 
            inner join sub_categories sc on ss.sub_id = sc.sub_id  
            left join shop_photos sp on s.shop_id = sp.shop_id
        `);

        // Group shops by subcategory
        const shopsBySubcategory = {};
        rows.forEach(row => {
            const subcategory = row.sub_name;
            if (!shopsBySubcategory[subcategory]) {
                shopsBySubcategory[subcategory] = [];
            }
            const shop = {
                shop_id: row.shop_id,
                shop_name: row.shop_name,
                shop_phone: row.shop_phone,
                shop_address: row.shop_address,
                latitude: row.latitude,
                longitude: row.longitude,
                shop_rating: row.shop_rating,
                // Check if shop_photo exists and add to the array
                shop_photos: row.shop_photo ? [row.shop_photo] : []
            };
            // Check if the shop already exists in the list
            const existingShopIndex = shopsBySubcategory[subcategory].findIndex(existingShop => existingShop.shop_id === shop.shop_id);
            if (existingShopIndex === -1) {
                shopsBySubcategory[subcategory].push(shop);
            } else {
                // If the shop already exists, add the shop_photo to its array
                shopsBySubcategory[subcategory][existingShopIndex].shop_photos.push(row.shop_photo);
            }
        });

        res.status(200).json({ state: "success", shops: shopsBySubcategory });
    } catch (error) {
        console.error('Error getting shops: ', error);
        return res.status(500).json({ state: 'fail', message: error });
    }
};

export const getCategories = async (req,res) =>{
    try {
        const [rows] = await pool.query(`
        SELECT mc.main_id, mc.main_name, sc.sub_id, sc.sub_name
        FROM main_categories mc
        LEFT JOIN sub_categories sc ON mc.main_id = sc.main_id
        `); 
        const proccessedRows = [];
        rows.forEach(row => {
            proccessedRows.push({
                main: `${row.main_name}-${row.main_id}`,
                sub:`${row.sub_name}-${row.sub_id}`
            });
        });
        res.status(200).json({state: "success", proccessedRows});
        
    } catch (error) {
        console.error('Error getting categories : ', error);
        return res.status(500).json({ state: 'fail', message: error });
    }
};


export const getShopOffers = async (req, res) => {
    try {
        const { shop_id } = req.body;

        let query = `
            SELECT od.offer_id, od.offer_name, od.description, od.expiration_date, o.start_date,
                   GROUP_CONCAT(op.offer_photo) AS offer_photos
            FROM offer_details od
            INNER JOIN offers o ON od.offer_id = o.offer_id
            LEFT JOIN offer_photos op ON o.offer_id = op.offer_id
        `;

        let params = [];

        // Check if shop_id is '*'
        if (shop_id === '*') {
            query += `
                GROUP BY od.offer_id
            `;
        } else {
            query += `
                WHERE o.shop_id = ?
                GROUP BY od.offer_id
            `;
            params.push(shop_id);
        }

        const [rows] = await pool.query(query, params);

        const offers = rows.map(row => ({
            offer_id: row.offer_id,
            offer_name: row.offer_name,
            description: row.description,
            expiration_date: row.expiration_date,
            start_date: row.start_date,
            offer_photos: row.offer_photos ? row.offer_photos.split(',') : []
        }));

        res.status(200).json({ state: "success", offers });
    } catch (error) {
        console.error('Error getting offers: ', error);
        return res.status(500).json({ state: 'fail', message: error });
    }
};

export const addFollow = async (req,res)=>{
    try {
        const {cust_email,shop_id} = req.body;
        const [rows] = await pool.query(`
            insert into following (cust_email,shop_id) values (?,?)
        `,[cust_email,shop_id]);

        if (rows.affectedRows > 0) {
            return res.status(200).json({ state: 'success' });
        } else {
            return res.status(400).json({ state: 'fail', message: 'Failed following the shop' });
        }
    } catch (error) {
        console.error('Error following the shop:', error);
        return res.status(500).json({ state: 'error', message: error });
    }

};

export const addFavorite = async (req,res)=>{
    try {
        const {cust_email,offer_id} = req.body;
        const [rows] = await pool.query(`
            insert into favorites (cust_email,offer_id) values (?,?)
        `,[cust_email,offer_id]);

        if (rows.affectedRows > 0) {
            return res.status(200).json({ state: 'success' });
        } else {
            return res.status(400).json({ state: 'fail', message: 'Failed adding the favorite' });
        }
    } catch (error) {
        console.error('Error adding the favorite :', error);
        return res.status(500).json({ state: 'error', message: error });
    }

};

export const fetchFollowings = async (req, res) => {
    try {
        const { cust_email } = req.body;
        const [rows] = await pool.query(`
            SELECT
                s.shop_id,
                s.shop_name,
                s.shop_phone,
                s.shop_address,
                s.latitude,
                s.longitude,
                s.shop_rating,
                GROUP_CONCAT(sp.shop_photo) AS shop_photos
            FROM
                shops s 
            LEFT JOIN
                shop_photos sp ON s.shop_id = sp.shop_id
            INNER JOIN
                following f ON s.shop_id = f.shop_id
            WHERE
                f.cust_email = ?
            GROUP BY
                s.shop_id
        `, [cust_email]);

        const shops = rows.map(row => ({
            shop_id: row.shop_id,
            shop_name: row.shop_name,
            shop_phone: row.shop_phone,
            shop_address: row.shop_address,
            latitude: row.latitude,
            longitude: row.longitude,
            shop_rating: row.shop_rating,
            shop_photos: row.shop_photos ? row.shop_photos.split(',') : [],
        }));

        if (shops.length > 0) {
            return res.status(200).json({ state: 'success', shops });
        } else {
            return res.status(404).json({ state: 'fail', message: 'No followings found for the specified user' });
        }
    } catch (error) {
        console.error('Error getting the followings:', error);
        return res.status(500).json({ state: 'error', message: error });
    }
};

export const fetchFavorites = async (req, res) => {
    try {
        const { cust_email } = req.body;
        const [rows] = await pool.query(`
            SELECT
                od.offer_id,
                od.offer_name,
                od.description,
                od.expiration_date,
                o.start_date,
                GROUP_CONCAT(op.offer_photo) AS offer_photos,
                s.shop_id,
                s.shop_name,
                s.shop_phone,
                s.shop_address,
                s.latitude,
                s.longitude,
                s.shop_rating
            FROM
                offer_details od
            INNER JOIN
                offers o ON od.offer_id = o.offer_id
            INNER JOIN
                shops s ON o.shop_id = s.shop_id
            LEFT JOIN
                offer_photos op ON o.offer_id = op.offer_id
            INNER JOIN
                favorites f ON o.offer_id = f.offer_id
            WHERE
                f.cust_email = ?
            GROUP BY
                od.offer_id
        `, [cust_email]);

        const offers = rows.map(row => ({
          offer_data:{  offer_id: row.offer_id,
            offer_name: row.offer_name,
            description: row.description,
            expiration_date: row.expiration_date,
            start_date: row.start_date,
            offer_photos: row.offer_photos ? row.offer_photos.split(',') : [],
         },offer_shop:{   shop_id:row.shop_id,
            shop_name: row.shop_name,
            shop_phone: row.shop_phone,
            shop_address: row.shop_address,
            latitude: row.latitude,
            longitude: row.longitude,
            shop_rating: row.shop_rating}
        }));

        if (offers.length > 0) {
            return res.status(200).json({ state: 'success', offers });
        } else {
            return res.status(400).json({ state: 'fail', message: 'Failed getting the favorites' });
        }
    } catch (error) {
        console.error('Error getting the favorites:', error);
        return res.status(500).json({ state: 'error', message: error });
    }
};


export const evaluateShop = async (req,res) =>{
    try {
        const {
            cust_email,
            shop_id,
            prices_feedback,
            products_quality_feedback,
            service_quality_feedback,
            overall_rating,
            old_rating
         } = req.body;
        const [rows] = await pool.query(`
            insert into evaluation (cust_email,shop_id,prices_feedback,products_quality_feedback,service_quality_feedback,overall_rating) values (?,?,?,?,?,?)
        `,[     cust_email,
            shop_id,
            prices_feedback,
            products_quality_feedback,
            service_quality_feedback,
            overall_rating
        ]);

        if (rows.affectedRows > 0) {
            const new_raitng = (parseInt(old_rating) + parseInt(overall_rating))/2;
            console.log(`\n\n\n\n\n ${new_raitng} \n\n\n\n\n\n`);
            const [updateRows] = await pool.query(`
                UPDATE shops SET shop_rating = ? where shop_id = ?
            `,[new_raitng ,shop_id]);
            if(updateRows.affectedRows > 0){
                return res.status(200).json({ state: 'success'});
            }else{
                return res.status(400).json({ state: 'fail', message: 'Failed updating the shop rating' });
            }
        } else {
            return res.status(400).json({ state: 'fail', message: 'Failed Evaluation the shop' });
        }
    } catch (error) {
        console.error('Error Evaluation the shop:', error);
        return res.status(500).json({ state: 'error', message: error });
    }
};

export const getEvaluates = async (req,res)=>{
    try {
        const {shop_id} = req.body;
        const [rows] = await pool.query(`
            select * from evaluation where shop_id = ?
        `,[shop_id]);
        res.status(200).json({state:"success", rows});
    } catch (error) {
        console.error('Error get Evaluations ', error);
        return res.status(500).json({ state: 'error', message: error });        
    }
};



export const doSearch = async (req,res)=>{
    try {
        const{search_text} = req.body;
        const[rows] = await pool.query(`
        SELECT s.*, shop_photo
        FROM shops s 
        LEFT JOIN shop_photos sp ON s.shop_id = sp.shop_id 
        WHERE 
        LOWER(shop_name) LIKE CONCAT('%', ?, '%') OR 
        LOWER(shop_address) LIKE CONCAT('%', ?, '%') OR 
        shop_phone LIKE CONCAT('%', ?, '%') OR 
        shop_rating LIKE CONCAT('%', ?, '%');
                `,[search_text,search_text,search_text,search_text]);

        const shops = [];
        rows.forEach(row => {
            const shop = {
                shop_id: row.shop_id,
                shop_name: row.shop_name,
                shop_phone: row.shop_phone,
                shop_address: row.shop_address,
                latitude: row.latitude,
                longitude: row.longitude,
                shop_rating: row.shop_rating,
                shop_photos: row.shop_photo ? [row.shop_photo] : []
            };

            const existingShopIndex = shops.findIndex(existingShop => existingShop.shop_id === shop.shop_id);
            if (existingShopIndex === -1) {
                shops.push(shop);
            } else {
                shops[existingShopIndex].shop_photos.push(row.shop_photo);
            }
        });
        res.status(200).json({ state: "success", shops });
    } catch (error) {
        console.error('Error searching ', error);
        return res.status(500).json({ state: 'error', message: error });
    }
};