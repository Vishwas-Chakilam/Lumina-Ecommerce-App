package com.Lumina.Ecom.wishlist;

import com.Lumina.Ecom.product.Product;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistItemRepository wishlistItemRepository;

    public WishlistController(WishlistItemRepository wishlistItemRepository) {
        this.wishlistItemRepository = wishlistItemRepository;
    }

    @GetMapping
    public ResponseEntity<List<Product>> getWishlist(@RequestParam("userId") String userId) {
        UUID uid = UUID.fromString(userId);
        List<WishlistItem> items = wishlistItemRepository.findByIdUserId(uid);
        List<Product> products = items.stream()
                .map(WishlistItem::getProduct)
                .collect(Collectors.toList());
        return ResponseEntity.ok(products);
    }

    @PostMapping("/toggle")
    public ResponseEntity<Void> toggleWishlist(
            @RequestParam("userId") String userId,
            @RequestParam("productId") String productId
    ) {
        UUID uid = UUID.fromString(userId);
        boolean exists = wishlistItemRepository.existsByIdUserIdAndIdProductId(uid, productId);
        if (exists) {
            wishlistItemRepository.deleteByIdUserIdAndIdProductId(uid, productId);
        } else {
            WishlistItem.WishlistItemId id = new WishlistItem.WishlistItemId(uid, productId);
            WishlistItem item = WishlistItem.builder()
                    .id(id)
                    .createdAt(OffsetDateTime.now())
                    .build();
            wishlistItemRepository.save(item);
        }
        return ResponseEntity.ok().build();
    }
}

