package com.Lumina.Ecom.product;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository productRepository;

    public ProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @GetMapping
    public ResponseEntity<List<Product>> getProducts(
            @RequestParam(value = "category", required = false) String categoryId,
            @RequestParam(value = "featured", required = false) Boolean featured
    ) {
        if (Boolean.TRUE.equals(featured)) {
            return ResponseEntity.ok(productRepository.findByFeaturedTrue());
        }
        if (categoryId != null && !categoryId.isBlank()) {
            return ResponseEntity.ok(productRepository.findByCategoryId(categoryId));
        }
        return ResponseEntity.ok(productRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable("id") String id) {
        return productRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}

