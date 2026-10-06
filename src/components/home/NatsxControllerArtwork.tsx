import styles from "./NatsxControllerArtwork.module.css";

export default function NatsxControllerArtwork() {
  return (
    <div
      className={styles.artwork}
      aria-hidden="true"
    >
      <div className={styles.grid} />

      <div className={styles.topBar}>
        <span className={styles.brand}>
          NATSX / CONTROLLER
        </span>

        <span className={styles.status}>
          <i />
          SYSTEM READY
        </span>
      </div>

      <div className={styles.phone}>
        <div className={styles.phoneScreen}>
          <span className={styles.phoneLabel}>
            ANDROID
          </span>

          <div className={styles.stick}>
            <i />
          </div>

          <div className={styles.dpad}>
            <i />
            <i />
          </div>

          <div className={styles.faceButtons}>
            <i />
            <i />
            <i />
            <i />
          </div>

          <span className={styles.phoneTech}>
            KOTLIN
          </span>
        </div>
      </div>

      <div className={styles.transport}>
        <span className={styles.transportLabel}>
          SMART CONNECTION
        </span>

        <div className={styles.transportLine}>
          <i />
          <i />
          <i />
        </div>

        <div className={styles.transportModes}>
          <span>USB</span>
          <span>WI-FI</span>
          <span>BT</span>
        </div>

        <span className={styles.transportMeta}>
          HEALTH / FAILOVER / RECOVERY
        </span>
      </div>

      <div className={styles.receiver}>
        <div className={styles.windowBar}>
          <i />
          <span>
            WINDOWS RECEIVER
          </span>
          <b>
            C# / .NET
          </b>
        </div>

        <div className={styles.receiverBody}>
          <div className={styles.metric}>
            <span>TRANSPORT</span>
            <strong>USB DIRECT</strong>
          </div>

          <div className={styles.metric}>
            <span>LATENCY</span>
            <strong>HEALTHY</strong>
          </div>

          <div className={styles.metric}>
            <span>SESSION</span>
            <strong>TRUSTED</strong>
          </div>

          <div className={styles.signal}>
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
        </div>
      </div>

      <div className={styles.controller}>
        <div className={styles.controllerBody}>
          <span className={styles.controllerStickLeft} />
          <span className={styles.controllerStickRight} />

          <span className={styles.controllerDpad}>
            <i />
            <i />
          </span>

          <span className={styles.controllerButtons}>
            <i />
            <i />
            <i />
            <i />
          </span>
        </div>

        <span className={styles.controllerLabel}>
          XBOX 360 COMPATIBLE
        </span>
      </div>

      <div className={styles.footer}>
        <span>
          ANDROID
        </span>
        <i />
        <span>
          SHARED PROTOCOL
        </span>
        <i />
        <span>
          WINDOWS
        </span>
      </div>
    </div>
  );
}
