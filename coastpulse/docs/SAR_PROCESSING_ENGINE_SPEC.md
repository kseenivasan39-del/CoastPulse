# COASTPULSE — Scientific Processing Engine & Algorithm Specification

## 1. Mathematical Foundations & Processing Pipeline

The **COASTPULSE Scientific Processing Engine** (`coastpulse-scientific-engine`) implements a fully deterministic, reproducible pipeline for calibrating radar backscatter, performing bitemporal change detection, delineating dynamic coastal water boundaries, and monitoring mangrove forest structure.

---

## 2. Radiometric Calibration & Transformation

### 2.1 Linear Power to Decibel Transformation
NISAR L2 GCOV products distribute geocoded radar backscatter in linear power units ($\gamma^0$). Linear values are converted into decibel space using:

$$\gamma^0_{\text{dB}} = 10 \cdot \log_{10}(\gamma^0_{\text{linear}})$$

To prevent numerical divergence in zero-signal regions, backscatter is clipped against the instrument Noise Equivalent Sigma Zero ($NESZ = -28.0\text{ dB}$, linear threshold $\approx 1.58 \times 10^{-3}$).

### 2.2 Refined Lee Adaptive Speckle Filtering
To suppress coherent radar speckle while preserving sharp coastal boundaries, tidal mudflats, and narrow mangrove creeks, we implement an adaptive variance filter (Refined Lee filter with Equivalent Number of Looks $ENL = 4.8$):

$$\hat{x} = \bar{y} + W \cdot (y - \bar{y})$$

Where:
- $\bar{y}$ is the local window mean.
- $W = \max\left(0, \frac{\text{Var}(y) - \sigma_v^2}{\text{Var}(y)}\right)$ is the adaptive damping weight.
- $\sigma_v^2 = \frac{\bar{y}^2}{ENL}$ is the theoretical multi-look multiplicative noise variance.

---

## 3. Bitemporal Change Detection & Spatial Clustering

### 3.1 Log-Ratio Difference Analysis
Between two geometrically and radiometrically compatible scenes ($T_1$ reference, $T_2$ repeat pass), the backscatter difference is calculated in decibel space:

$$\Delta\gamma^0_{\text{dB}} = 10 \cdot \log_{10}\left(\frac{\gamma^0_{T_2}}{\gamma^0_{T_1}}\right) = \gamma^0_{T_2,\text{dB}} - \gamma^0_{T_1,\text{dB}}$$

### 3.2 Threshold-Based Spatial Clustering
- **Significance Threshold ($\tau$):** Surface changes are flagged when $|\Delta\gamma^0_{\text{dB}}| \ge \tau$ (default $\tau = \pm 2.5\text{ dB}$, corresponding to greater than a factor of $1.77$ shift in linear radar power).
- **Spatial Filtering:** Small isolated blips caused by residual speckle are eliminated using morphological area opening (rejecting clusters with area $< 15\text{ pixels}$, or $< 0.15\text{ ha}$ at $10\text{m}$ resolution).

---

## 4. Coastal Wetland Water & Vegetation Indices

### 4.1 Adaptive Otsu Surface Water Delineation
Open surface water acts as a specular reflector for microwave radiation, returning low backscatter to the antenna. The threshold $T_{\text{water}}$ is calculated dynamically using Otsu's bimodal histogram variance minimization:

$$\sigma_w^2(t) = \omega_0(t)\sigma_0^2(t) + \omega_1(t)\sigma_1^2(t)$$

Constrained within physical bounds: $-28\text{ dB} \le T_{\text{water}} \le -14\text{ dB}$.

### 4.2 Dual-Polarization Radar Vegetation Index (RVI)
Canopy biomass in the Muthupet mangrove forest is evaluated using the dual-polarization RVI formulation:

$$RVI = \frac{4 \cdot \sigma^0_{HV}}{\sigma^0_{HH} + \sigma^0_{HV}}$$

- $RVI < 0.3$: Bare soil, tidal mudflat, open water.
- $0.3 \le RVI \le 0.6$: Sparse vegetation, salt marsh shrubs.
- $RVI > 0.6$: Dense multi-layer mangrove canopy (*Avicennia marina* / *Rhizophora mucronata*).

---

## 5. Scientific Validation Metrics

Validation against independent ground reference masks is strictly computed using:
- **Confusion Matrix:** $TP, FP, TN, FN$
- **Precision:** $\frac{TP}{TP + FP}$
- **Recall:** $\frac{TP}{TP + FN}$
- **$F_1$ Score:** $\frac{2 \cdot \text{Precision} \cdot \text{Recall}}{\text{Precision} + \text{Recall}}$
- **Intersection over Union (IoU):** $\frac{TP}{TP + FP + FN}$

---

## 6. Memory-Bounded Tiled Processing
To handle high-volume satellite datasets without memory crashes, `NISARHDF5Reader` provides window-based chunk generators (`iterate_tiles(tile_size=512)`), ensuring memory usage never exceeds $100\text{ MB}$ regardless of granule size.
