function Banner({ onOpenRamadan }) {
  return (
    <section className="banner-section" onClick={onOpenRamadan}>
      <div className="slider-container">
        <div className="slide slide-1 active">
          <div>
            <h2 style={{ fontSize: '35px' }}>🌙 عروض رمضان هلت!</h2>
            <p style={{ fontSize: '20px' }}>اضغط هنا واكتشف هديتك (خصم 50%)</p>
          </div>
          <img src="https://cdn-icons-png.flaticon.com/512/3233/3233483.png" className="slide-img" alt="Ramadan" />
        </div>
      </div>
    </section>
  );
}

export default Banner;
