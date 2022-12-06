<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

-   Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
-   Website - [https://nestjs.com](https://nestjs.com/)
-   Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).

## Todo list

### Auth module

-   [x] [Login](#login)

### User module

-   [x] [Get user detail](#get-user-detail)
-   [x] [Update user](#update-user)

### Product module

-   [x] [Get product line detail](#get-product-line-detail)
-   [x] [Get product detail](#get-product-detail)

### Admin module

-   [x] Create user
-   [ ] Delete user (TODO: delete storage and inside products)
-   [x] Create storage for producer and agency
-   [x] Create product line
-   [ ] View report (status | producer | agency | warranty center)

### Producer module

-   [x] [Create product](#create-product)
-   [x] Export product to agency
-   [ ] Receive error product from warranty center
-   [ ] Report about product (type | status) (month | quarter | year)
-   [ ] Report about sold product (month | quarter | year)
-   [ ] Report about error product (line | producer | agency)

### Agency module

-   [ ] Import new product from producer
-   [ ] Sold product
-   [ ] Receive error product from customer
-   [ ] Transfer error product to warranty center
-   [ ] Receive fixed product from warranty center
-   [ ] Return fixed product to customer
-   [ ] Return new product to customer
-   [ ] Report about product (line) (month | quarter | year)
-   [ ] Report about sold product (line) (month | quarter | year)
-   TODO: recall

### Warranty center module

-   [ ] Receive error product which still under warranty from agency
-   [ ] Return fixed product to agency
-   [ ] Notify agency that the product can not be fixed
-   [ ] Return error product to producer
-   [ ] Report about product (line | status) (month | quarter | year)

## API Documentation

### Auth module

#### Login

```http
POST /api/v1/auth/login
```

| Parameter  | Type     | Description  |
| :--------- | :------- | :----------- |
| `email`    | `string` | **Required** |
| `password` | `string` | **Required** |

```javascript
{
    "success": true,
    "code": 200,
    "message": "Success",
    "data": {
        "user": {
            "_id": "638b4b7718844a05965a0ca3",
            "email": "admin@productmove.com",
            "phoneNumber": "0123456789",
            "name": "Admin",
            "role": "admin",
            "avatar": "https://avatar.com"
        },
        "accessToken": "accessToken",
        "refreshToken": "refreshToken"
    },
    "version": "1.0.0"
}
```

### User module

#### Get user detail

```http
GET /api/v1/user/:id
```

| Parameter | Type       | Description  |
| :-------- | :--------- | :----------- |
| `id`      | `ObjectId` | **Required** |

```javascript
{
    "success": true,
    "code": 200,
    "message": "Success",
    "data": {
        "_id": "638b4b7718844a05965a0ca3",
        "email": "admin@productmove.com",
        "phoneNumber": "0123456789",
        "name": "Admin",
        "role": "admin",
        "avatar": "https://avatar.com"
    },
    "version": "1.0.0"
}
```

#### Update user

```http
PATCH /api/v1/user/:id
```

| Parameter         | Type       | Description  |
| :---------------- | :--------- | :----------- |
| `id`              | `ObjectId` | **Required** |
| `confirmPassword` | `string`   | **Required** |
| `name`            | `string`   | **Optional** |
| `phoneNumber`     | `string`   | **Optional** |
| `avatar`          | `string`   | **Optional** |
| `password`        | `string`   | **Optional** |

```javascript
{
    "success": true,
    "code": 200,
    "message": "Success",
    "data": {
        "_id": "638b4b7718844a05965a0ca3",
        "email": "admin@productmove.com",
        "phoneNumber": "0123456789",
        "name": "Admin",
        "role": "admin",
        "avatar": "https://avatar.com"
    },
    "version": "1.0.0"
}
```

### Product module

#### Get product line detail

```http
GET /api/v1/product/product-line/:id
```

| Parameter | Type       | Description  |
| :-------- | :--------- | :----------- |
| `id`      | `ObjectId` | **Required** |

```javascript
{
    "success": true,
    "code": 200,
    "message": "Success",
    "data": {
        "_id": "638d6ba0f16ac5aff21e9969",
        "name": "Iphone",
        "price": 1000,
        "quantityOfProduct": 0
    },
    "version": "1.0.0"
}
```

#### Get product detail

```http
GET /api/v1/product/:id
```

| Parameter | Type       | Description  |
| :-------- | :--------- | :----------- |
| `id`      | `ObjectId` | **Required** |

```javascript
{
    "success": true,
    "code": 200,
    "message": "Success",
    "data": {
        "_id": "638d813b70c5c2e16b58e5dd",
        "createdAt": "2022-12-05T05:27:23.322Z",
        "updatedAt": "2022-12-05T05:27:23.322Z",
        "deletedAt": null,
        "createdBy": "638d69f4383b14090809a7e8",
        "updatedBy": null,
        "deletedBy": null,
        "productLineId": "638d6bbce7f9bf2f085460c9",
        "userId": "638d69f4383b14090809a7e8",
        "storageId": "638d809c085dd06475c5f016",
        "name": "Iphone 1",
        "description": "Iphone 1",
        "weight": 1000,
        "displaySize": 9.7,
        "bodySize": "1x1",
        "color": "black",
        "bodyBuild": "body build",
        "batteryVolume": 1000,
        "status": "new",
        "location": "in_producer",
        "sold": false,
        "__v": 0,
        "productLine": {
            "_id": "638d6bbce7f9bf2f085460c9",
            "createdAt": "2022-12-05T03:55:40.423Z",
            "updatedAt": "2022-12-05T05:27:23.327Z",
            "deletedAt": null,
            "createdBy": "638b4b7718844a05965a0ca3",
            "updatedBy": "638d69f4383b14090809a7e8",
            "deletedBy": null,
            "name": "Iphone",
            "price": 1000,
            "quantityOfProduct": 1,
            "__v": 0
        }
    },
    "version": "1.0.0"
}
```

### Producer module

#### Create product

```http
POST /api/v1/producer/product
```

| Parameter       | Type       | Description                               |
| :-------------- | :--------- | :---------------------------------------- |
| `productLineId` | `ObjectId` | **Required**                              |
| `storageId`     | `ObjectId` | **Required**                              |
| `name`          | `string`   | **Required**                              |
| `description`   | `string`   | **Required**                              |
| `weight`        | `number`   | **Required**. (in gram)                   |
| `displaySize`   | `number`   | **Required**. (in inch)                   |
| `bodySize`      | `string`   | **Required**                              |
| `color`         | `string`   | **Required**. (in [black,gray,red,white]) |
| `bodyBuild`     | `string`   | **Required**                              |
| `batteryVolume` | `number`   | **Required**. (in mAh)                    |

```javascript
{
    "success": true,
    "code": 200,
    "message": "Create product successfully",
    "data": {
        "createdAt": "2022-12-05T05:27:23.322Z",
        "updatedAt": "2022-12-05T05:27:23.322Z",
        "deletedAt": null,
        "createdBy": "638d69f4383b14090809a7e8",
        "updatedBy": null,
        "deletedBy": null,
        "productLineId": "638d6bbce7f9bf2f085460c9",
        "userId": "638d69f4383b14090809a7e8",
        "storageId": "638d809c085dd06475c5f016",
        "name": "Iphone 1",
        "description": "Iphone 1",
        "weight": 1000,
        "displaySize": 9.7,
        "bodySize": "1x1",
        "color": "black",
        "bodyBuild": "body build",
        "batteryVolume": 1000,
        "status": "new",
        "location": "in_producer",
        "sold": false,
        "_id": "638d813b70c5c2e16b58e5dd",
        "__v": 0
    }
    "version": "1.0.0"
}
```
