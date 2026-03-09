package com.Lumina.Ecom.wishlist;

import com.Lumina.Ecom.product.Product;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "wishlist_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishlistItem {

    @EmbeddedId
    private WishlistItemId id;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", referencedColumnName = "id", insertable = false, updatable = false)
    private Product product;

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WishlistItemId {

        @Column(name = "user_id", nullable = false)
        private UUID userId;

        @Column(name = "product_id", nullable = false)
        private String productId;
    }
}

