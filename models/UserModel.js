class UserModel {
    constructor({
      email,
      password,
      username,
      phone,
      address,
      image,
      uId,
      contacts,
      admin
    }) {
      this.email = email;
      this.password = password;
      this.username = username;
      this.phone = phone;
      this.address = address;
      this.image = image;
      this.uId = uId;
      this.contacts = contacts;
      this.admin = admin;
    }
  
    static fromJson(json) {
      return new UserModel({
        email: json['email'],
        password: json['password'],
        username: json['name'],
        phone: json['phone'],
        address: json['address'],
        image: json['image'],
        uId: json['uId'],
        contacts: json['contacts'],
        admin: json['admin']
      });
    }
  
  }
  