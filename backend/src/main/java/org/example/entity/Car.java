package org.example.entity;

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
@Document(collection = "cars")
public class Car {

    @Id
    private String id;

    private String name;

    private BigDecimal price;

    private Integer manufactureYear;

    private String color;

    private String engine;

    private String transmission;

    private Integer seats;

    private String description;

    private String image;

    @DBRef
    private Category category;
}