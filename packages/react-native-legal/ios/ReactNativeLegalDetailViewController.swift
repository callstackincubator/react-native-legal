class ReactNativeLegalDetailViewController: UIViewController {
  private var licenseContentTextView: UITextView = {
    let textView = UITextView()

    #if os(tvOS)
      let fontSize: CGFloat = 40
      let horizontalContentInset: CGFloat = 100
      let bottomContentInset: CGFloat = 100
    #else
      let fontSize: CGFloat = 13.3
      let horizontalContentInset: CGFloat = 26
      let bottomContentInset: CGFloat = 16
    #endif

    textView.alwaysBounceVertical = true
    #if os(iOS)
      textView.dataDetectorTypes = .link
    #endif
    textView.font = UIFont.systemFont(ofSize: fontSize)
    #if os(iOS)
      textView.isEditable = false
    #endif
    #if os(tvOS)
      textView.isSelectable = true
      textView.isUserInteractionEnabled = true
    #endif
    textView.textContainerInset = UIEdgeInsets(
      top: 0, left: horizontalContentInset, bottom: bottomContentInset,
      right: horizontalContentInset)
    textView.translatesAutoresizingMaskIntoConstraints = false

    if #available(iOS 13.0, tvOS 13.0, *) {
      #if os(iOS)
        textView.backgroundColor = .systemBackground
      #endif
      textView.textColor = .secondaryLabel
    }

    return textView
  }()

  private var metadata: ReactNativeLegalLicenseMetadata

  init(metadata: ReactNativeLegalLicenseMetadata) {
    self.metadata = metadata
    super.init(nibName: nil, bundle: nil)
    self.title = metadata.name
  }

  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }

  #if os(iOS)
    private var scrolledToTopOnMount = false

    override func viewDidLayoutSubviews() {
      super.viewDidLayoutSubviews()

      if scrolledToTopOnMount {
        return
      }

      licenseContentTextView.setContentOffset(CGPoint.zero, animated: false)
      scrolledToTopOnMount = true
    }
  #endif

  override func viewDidLoad() {
    super.viewDidLoad()

    view.addSubview(licenseContentTextView)
    #if os(iOS)
      if #available(iOS 13.0, *) {
        view.backgroundColor = .systemBackground
      }
    #endif

    NSLayoutConstraint.activate([
      licenseContentTextView.topAnchor.constraint(
        equalToSystemSpacingBelow: view.safeAreaLayoutGuide.topAnchor, multiplier: 1.0),
      licenseContentTextView.bottomAnchor.constraint(
        equalToSystemSpacingBelow: view.safeAreaLayoutGuide.bottomAnchor, multiplier: 1.0),
      licenseContentTextView.leadingAnchor.constraint(
        equalToSystemSpacingAfter: view.safeAreaLayoutGuide.leadingAnchor, multiplier: 1.0),
      licenseContentTextView.trailingAnchor.constraint(
        equalToSystemSpacingAfter: view.safeAreaLayoutGuide.trailingAnchor, multiplier: 1.0),
    ])

    licenseContentTextView.text = metadata.content
  }

  #if os(tvOS)
    private var tvRemoteGestureRecognizers: [String: UISwipeGestureRecognizer] = [:]

    override func didUpdateFocus(
      in context: UIFocusUpdateContext, with coordinator: UIFocusAnimationCoordinator
    ) {
      if context.previouslyFocusedView == context.nextFocusedView {
        return
      }

      if context.nextFocusedView == licenseContentTextView {
        licenseContentTextView.becomeFirstResponder()
        self.addSwipeGestureRecognizers()
      } else if context.previouslyFocusedView == licenseContentTextView {
        self.removeSwipeGestureRecognizers()
        licenseContentTextView.resignFirstResponder()
      }
    }

    private func addSwipeGestureRecognizers() {
      let recognizerUp = UISwipeGestureRecognizer(target: self, action: #selector(swipedUp))
      recognizerUp.direction = .up

      let recognizerDown = UISwipeGestureRecognizer(target: self, action: #selector(swipedDown))
      recognizerDown.direction = .down

      tvRemoteGestureRecognizers["swipedUp"] = recognizerUp
      tvRemoteGestureRecognizers["swipedDown"] = recognizerDown

      for recognizer in tvRemoteGestureRecognizers.values {
        licenseContentTextView.addGestureRecognizer(recognizer)
      }
    }

    private func removeSwipeGestureRecognizers() {
      if let recognizerUp = tvRemoteGestureRecognizers["swipedUp"] {
        licenseContentTextView.removeGestureRecognizer(recognizerUp)
      }

      if let recognizerDown = tvRemoteGestureRecognizers["swipedDown"] {
        licenseContentTextView.removeGestureRecognizer(recognizerDown)
      }

      tvRemoteGestureRecognizers.removeAll()
    }

    @objc private func swipedUp() {
      let offset =
        licenseContentTextView.contentOffset.y - licenseContentTextView.visibleSize.height / 2

      self.swipeVertical(with: offset)
    }

    @objc private func swipedDown() {
      let offset =
        licenseContentTextView.contentOffset.y + licenseContentTextView.visibleSize.height / 2

      self.swipeVertical(with: offset)
    }

    @objc private func swipeVertical(with offset: CGFloat) {
      DispatchQueue.main.async {
        let newOffset = min(
          max(offset, 0),
          self.licenseContentTextView.contentSize.height
            - self.licenseContentTextView.visibleSize.height)

        UIView.animate(withDuration: 0.5) {
          self.licenseContentTextView.contentOffset = CGPoint(
            x: self.licenseContentTextView.contentOffset.x,
            y: newOffset
          )
        }
      }
    }
  #endif
}
