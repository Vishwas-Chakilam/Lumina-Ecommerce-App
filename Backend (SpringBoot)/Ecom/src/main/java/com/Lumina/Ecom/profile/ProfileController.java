package com.Lumina.Ecom.profile;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final UserProfileRepository userProfileRepository;
    private final AddressRepository addressRepository;

    public ProfileController(UserProfileRepository userProfileRepository, AddressRepository addressRepository) {
        this.userProfileRepository = userProfileRepository;
        this.addressRepository = addressRepository;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserProfile> getProfile(@PathVariable("userId") String userId) {
        UUID uid = UUID.fromString(userId);
        return userProfileRepository.findById(uid)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{userId}")
    public ResponseEntity<UserProfile> saveProfile(
            @PathVariable("userId") String userId,
            @RequestBody UserProfile body
    ) {
        UUID uid = UUID.fromString(userId);
        UserProfile profile = userProfileRepository.findById(uid)
                .orElseGet(() -> UserProfile.builder()
                        .userId(uid)
                        .createdAt(OffsetDateTime.now())
                        .build());
        profile.setName(body.getName());
        profile.setMobile(body.getMobile());
        profile.setCountry(body.getCountry());
        profile.setUpdatedAt(OffsetDateTime.now());
        userProfileRepository.save(profile);
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/{userId}/addresses")
    public ResponseEntity<List<Address>> getAddresses(@PathVariable("userId") String userId) {
        UUID uid = UUID.fromString(userId);
        return ResponseEntity.ok(addressRepository.findByUserId(uid));
    }

    @PostMapping("/{userId}/addresses")
    public ResponseEntity<Address> addAddress(
            @PathVariable("userId") String userId,
            @RequestBody Address body
    ) {
        UUID uid = UUID.fromString(userId);
        Address address = Address.builder()
                .userId(uid)
                .label(body.getLabel())
                .line1(body.getLine1())
                .country(body.getCountry())
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();
        addressRepository.save(address);
        return ResponseEntity.ok(address);
    }

    @PutMapping("/{userId}/addresses/{addressId}")
    public ResponseEntity<Address> updateAddress(
            @PathVariable("userId") String userId,
            @PathVariable("addressId") String addressId,
            @RequestBody Address body
    ) {
        UUID uid = UUID.fromString(userId);
        UUID addrId = UUID.fromString(addressId);

        return addressRepository.findById(addrId)
                .filter(addr -> addr.getUserId().equals(uid))
                .map(addr -> {
                    addr.setLabel(body.getLabel());
                    addr.setLine1(body.getLine1());
                    addr.setCountry(body.getCountry());
                    addr.setUpdatedAt(OffsetDateTime.now());
                    addressRepository.save(addr);
                    return ResponseEntity.ok(addr);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{userId}/addresses/{addressId}")
    public ResponseEntity<Void> deleteAddress(
            @PathVariable("userId") String userId,
            @PathVariable("addressId") String addressId
    ) {
        UUID uid = UUID.fromString(userId);
        UUID addrId = UUID.fromString(addressId);

        return addressRepository.findById(addrId)
                .filter(addr -> addr.getUserId().equals(uid))
                .map(addr -> {
                    addressRepository.delete(addr);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}

