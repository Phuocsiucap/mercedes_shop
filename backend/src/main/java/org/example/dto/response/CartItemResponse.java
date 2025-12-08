package org.example.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.entity.Car;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItemResponse {
    private String id;
    private Car car; // Or CarResponse if we want to hide some fields, but Car is fine for now
    private Integer quantity;
    private BigDecimal subTotal;
}
