import pool from "../database.js";


export const addMainCat = async (req,res)=> {
    try {
        const { main_category } = req.body;

        const [rows, fields] = await pool.query(
            `INSERT INTO main_categories (main_name) values (?)`,
            [main_category]
        );
        if (rows.affectedRows > 0) {
            return res.status(200).json({ state: 'success' });
        } else {
            return res.status(400).json({ state: 'fail', message: 'Failed to insert new main category' });
        }
    } catch (error) {
        console.error('Error inserting a new main category:', error);
        return res.status(500).json({ state: 'error', message: error });
    }
};

export const addSubcat = async (req,res)=> {
    try{
    const { main_category , sub_name } = req.body;

    const [rows, fields] = await pool.query(
        `INSERT INTO sub_categories (main_id , sub_name) values (
            (
                select main_id from main_categories where main_name = ?
            )
            ,?)`,
        [main_category,sub_name]
    );
    if (rows.affectedRows > 0) {
        return res.status(200).json({ state: 'success' });
    } else {
        return res.status(400).json({ state: 'fail', message: 'Failed to insert new sub category' });
    }
} catch (error) {
    console.error('Error inserting a new main category:', error);
    return res.status(500).json({ state: 'error', message: error });
}
};

export const addShop = async (req, res) => {
    try {
        const {
            shop_name,
            shop_phone,
            shop_address,
            lat,
            long,
            rating,
            subcategories
        } = req.body;
        const photos = req.files.map(file => file.filename);

        const [rows] = await pool.query(
            `INSERT INTO shops (shop_name, shop_phone, shop_address, latitude, longitude, shop_rating)
             VALUES (?, ?, ?, ?, ?, ?)`, 

            [shop_name, shop_phone, shop_address, lat, long, rating] 
        );

        if (rows.affectedRows > 0) {
            const shopId = rows.insertId;

            const subcategoryInsertQuery = `
                INSERT INTO shop_sub (shop_id, sub_id)
                SELECT ?, sub_id
                FROM sub_categories
                WHERE sub_name IN (?) `;

            await pool.query(subcategoryInsertQuery, [shopId, subcategories.split(',')]);
            
            const photoInsertQuery = `
                INSERT INTO shop_photos (shop_id, shop_photo)
                VALUES ? `;

            const photoData = photos.map(photo => [shopId, photo]);

            await pool.query(photoInsertQuery, [photoData]);

            return res.status(200).json({ state: 'success' });
        } else {
            return res.status(400).json({ state: 'fail', message: 'Failed to insert new shop' });
        }
    } catch (error) {
        console.error('Error inserting a new shop:', error);
        return res.status(500).json({ state: 'fail', message: error });
    }
};

export const addOffer = async (req,res)=> {
    try {
        const {
            offer_name,
            shop_name,
            shop_phone,
            description,
            start_date,
            expiration_date
        } = req.body;
        const photos = req.files.map(file => file.filename);


        const subcategoryInsertQuery = `
        INSERT INTO offers (shop_id , start_date)
        SELECT shop_id , ?
        FROM shops
        WHERE shop_name = ? and shop_phone = ? `;

        const [rows] = await pool.query(subcategoryInsertQuery, [ start_date ,shop_name , shop_phone]);
    

        if (rows.affectedRows > 0) {
            const offerId = rows.insertId;

            await pool.query(
                `INSERT INTO offer_details ( offer_id, offer_name, description, expiration_date)
                 VALUES (?,?, ?, ?)`,
                [offerId,offer_name, description, expiration_date] 
            );
            
            const photoInsertQuery = `
                INSERT INTO offer_photos (offer_id, offer_photo)
                VALUES ? `;

            const photoData = photos.map(photo => [offerId, photo]);

            await pool.query(photoInsertQuery, [photoData]);

            return res.status(200).json({ state: 'success' });
        } else {
            return res.status(400).json({ state: 'fail', message: 'Failed to insert new shop' });
        }
    } catch (error) {
        console.error('Error inserting a new shop:', error);
        return res.status(500).json({ state: 'fail', message: error });
    }
};

export const updateMainCategory = async (req,res) =>{
  try {
    const {main_id , main_name} = req.body;
    const [rows] = await pool.query(`
        update main_categories set main_name = ? where main_id = ?
    `,[main_name,main_id]);
    if(rows.affectedRows>0){
        res.status(200).json({state:"success"});
    }else{
        res.status(404).json({state:"fail", msg:"main category not found"});
    }
  } catch (error) {
    res.status(500).json({state:"fail", msg:error});    
  }  
};

export const updateSubcategory = async (req,res) =>{
    try {
      const {sub_id , sub_name} = req.body;
      const [rows] = await pool.query(`
          update sub_categories set sub_name = ? where sub_id = ?
      `,[sub_name,sub_id]);
      if(rows.affectedRows>0){
          res.status(200).json({state:"success"});
      }else{
          res.status(404).json({state:"fail", msg:"subcategory not found"});
      }
    } catch (error) {
      res.status(500).json({state:"fail", msg:error});    
    }  
  };


  export const updateShop = async (req,res) =>{
    try {
      const {
        shop_id,
        shop_name,
        shop_phone,
        shop_address,
        lat,
        long,
      } = req.body;

      const [rows] = await pool.query(`update shops set shop_name = ? , shop_phone = ? , shop_address = ? , latitude = ? , longitude = ?  where shop_id = ?`,
                                        [shop_name,shop_phone,shop_address,lat,long,shop_id]);
      if(rows.affectedRows>0){
          res.status(200).json({state:"success"});
      }else{
          res.status(404).json({state:"fail", msg:"shop not found"});
      }
    } catch (error) {
      res.status(500).json({state:"fail", msg:error});    
    }  
  };





  export const updateOffer = async (req,res) =>{
    try {
      const {
        offer_id,
        offer_name,
        description,
        expiration_date
      } = req.body;
      const [rows] = await pool.query(`
          update offer_details set   offer_name =  ?   ,  description = ?  , expiration_date = ?  where offer_id = ?
      `,[offer_name,description,expiration_date,offer_id]);
      if(rows.affectedRows>0){
          res.status(200).json({state:"success"});
      }else{
          res.status(404).json({state:"fail", msg:"offer not found"});
      }
    } catch (error) {
      res.status(500).json({state:"fail", msg:error});    
    }  
  };



  export const deleteMainCategory = async (req,res)=>{
    try {
        const{main_id} = req.body;
        const [rows] = await pool.query(`
            delete from main_categories where main_id = ?
        `,[main_id]);
        if(rows.affectedRows>0){
            res.status(200).json({state:"success"});
        }else{
            res.status(404).json({state:"fail", msg:"main category not found"});
        }
      } catch (error) {
        res.status(500).json({state:"fail", msg:error});    
      }  
  };

  export const deleteSubcategory = async (req,res)=>{
    try {
        const{sub_id} = req.body;
        const [rows] = await pool.query(`
            delete from sub_categories where sub_id = ?
        `,[sub_id]);
        if(rows.affectedRows>0){
            res.status(200).json({state:"success"});
        }else{
            res.status(404).json({state:"fail", msg:"sub category not found"});
        }
      } catch (error) {
        res.status(500).json({state:"fail", msg:error});    
      }  
  };

  export const deleteShop = async (req,res)=>{
    try {
        const{shop_id} = req.body;
        const [rows] = await pool.query(`
            delete from shops where shop_id = ?
        `,[shop_id]);
        if(rows.affectedRows>0){
            res.status(200).json({state:"success"});
        }else{
            res.status(404).json({state:"fail", msg:"shop not found"});
        }
      } catch (error) {
        res.status(500).json({state:"fail", msg:error});    
      }  
  };

  export const deleteOffer = async (req,res)=>{
    try {
        const{offer_id} = req.body;
        const [rows] = await pool.query(`
            delete from offers where offer_id = ?
        `,[offer_id]);
        if(rows.affectedRows>0){
            res.status(200).json({state:"success"});
        }else{
            res.status(404).json({state:"fail", msg:"offer not found"});
        }
      } catch (error) {
        res.status(500).json({state:"fail", msg:error});    
      }  
  };