import { request1 } from "../../utils/request";
import { Types } from "../Types"
import { getCSRFTokenFromCookie } from "../../Component/Token/getCSRFToken";
//user
const access_token = getCSRFTokenFromCookie("access_token");
const LoginUser = (data) => {
    // console.log("data "+data);
    return {
        type: Types.User.Login,
        payload: data,
    }
}
const LogoutUser = () => {
    return {
        type: Types.User.Logout,
    }
}
const UpdateUser = (data) => {
    console.log("update ", data);
    return {
        type: Types.User.Update,
        payload: data
    }
}
//address
const AddAddress = (data) => {
    return {
        type: Types.Address.AddAddress,
        payload: data
    }
}
const DeleteAddress = (data) => {
    console.log(data);
    return {
        type: Types.Address.DeleteAddress,
        payload: data
    }
}
const UpdateAddress = (data) => {
    return {
        type: Types.Address.UpdateAddress,
        payload: data
    }
}
//cartShopping
const AddProduct = async (data) => {
    try {
        const response = await request1.post("cart/add", {
            carId: data.id,
            quantity: data.number,
        }, {
            headers: {
                Authorization: `Bearer ${access_token}`,
                "Content-Type": "application/json",
            },
        });

        console.log(response);
        alert("Thêm sản phẩm vào giỏ hàng thành công");
        return {
            type: Types.ShoppingCart.AddProduct,
            payload: response.data.data // Assuming response.data.data contains the updated cart or added item
        }
    } catch (e) {
        console.log("lỗi", e);
        alert("Thêm sản phẩm thất bại: " + (e.response?.data?.message || e.message));
        return {
            type: "ERROR",
            payload: e
        }
    }
}

const DeleteProduct = async (data) => {
    try {
        const response = await request1.delete(`cart/items/${data.id}`, {
            headers: {
                Authorization: `Bearer ${access_token}`,
            }
        });
        console.log(response);
        return {
            type: Types.ShoppingCart.DeleteProduct,
            payload: response.data.data, // Updated cart
        }
    } catch (e) {
        console.log("lỗi", e);
        return { type: "ERROR", payload: e };
    }
}

const UpdateProduct = async (data) => {
    try {
        const response = await request1.put(`cart/items/${data.id}`, {
            quantity: data.quantity
        }, {
            headers: {
                Authorization: `Bearer ${access_token}`,
                "Content-Type": "application/json",
            }
        });
        return {
            type: Types.ShoppingCart.UpdateProduct,
            payload: response.data.data, // Updated cart
        }
    } catch (e) {
        console.log("lỗi", e);
        return { type: "ERROR", payload: e };
    }
}

const getCart = () => async dispatch => {
    try {
        const response = await request1.get("cart", {
            headers: {
                Authorization: `Bearer ${access_token}`,
                "Content-Type": "application/json",
            },
        });
        dispatch({
            type: Types.ShoppingCart.GetCart,
            payload: response.data.data.items, // Assuming structure is ApiResponse<CartResponse> where CartResponse has items
        });
    }
    catch (error) {
        console.log("Lỗi", error)
    }
    finally {
        // dispatch({ type: Types.ShoppingCart.GetCart, payload: false }); // This might clear the cart in UI if payload is false?
    }
}

export { LoginUser, LogoutUser, UpdateUser, UpdateAddress, DeleteAddress, AddAddress, UpdateProduct, DeleteProduct, AddProduct, getCart }