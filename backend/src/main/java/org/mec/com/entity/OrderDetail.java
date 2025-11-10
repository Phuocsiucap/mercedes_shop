package org.mec.com.entity;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "order_details")
public class OrderDetail {

    @Id
    private String id;

    @DBRef
    private Order order;

    @DBRef
    private Car car;

    private Integer quantity;

    private BigDecimal unitPrice;
}