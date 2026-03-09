package com.Lumina.Ecom.product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, String> {

    List<Product> findByFeaturedTrue();

    List<Product> findByCategoryId(String categoryId);
}

